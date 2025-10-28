'use server';
/**
 * @fileOverview Lhama AI 2 agent, a default AI agent for the Lhama Search platform.
 *
 * - lhamaAI2Agent - A function that processes user queries and returns AI-generated responses.
 * - LhamaAI2AgentInput - The input type for the lhamaAI2Agent function.
 * - LhamaAI2AgentOutput - The return type for the lhamaAI2Agent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { promises as fs } from 'fs';

// Use a relative path from the project root.
const trainingFilePath = 'src/ai/training.json';

type TrainingData = Record<string, string>;

async function readTrainingData(): Promise<TrainingData> {
  try {
    const data = await fs.readFile(trainingFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    console.error('Error reading training data:', error);
    return {};
  }
}

async function writeTrainingData(data: TrainingData): Promise<void> {
  try {
    await fs.writeFile(trainingFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing training data:', error);
  }
}

// Definição da ferramenta para chamar a Google Custom Search API
const customGoogleSearch = ai.defineTool(
  {
    name: 'customGoogleSearch',
    description: 'Searches the web using Google Custom Search API. Use this for recent events or topics outside of common knowledge.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.any(),
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_CSE_ID;

    if (!apiKey || !searchEngineId) {
      console.error("Google API Key or Search Engine ID is not configured.");
      return { error: "Search API is not configured." };
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(input.query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Custom Search API error:', errorData);
        return { error: `API request failed with status ${response.status}` };
      }
      const data = await response.json();
      // Mapeia os resultados para o formato esperado pelo resto do código
      return (data.items || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        pagemap: item.pagemap,
      }));
    } catch (err) {
      console.error('Error fetching search results:', err);
      return { error: 'Failed to fetch search results.' };
    }
  }
);


const LhamaAI2AgentInputSchema = z.object({
  query: z.string().describe('A pergunta do usuário a ser processada pelo agente de IA.'),
  mode: z.enum(['chat', 'search']).default('chat').describe('O modo de operação: "chat" para conversa padrão ou "search" para pesquisa na web.'),
});
export type LhamaAI2AgentInput = z.infer<typeof LhamaAI2AgentInputSchema>;

const LhamaAI2AgentOutputSchema = z.object({
  response: z.string().describe('A resposta gerada pela IA para a pergunta do usuário, formatada em HTML.'),
  searchResults: z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string(),
    pagemap: z.object({
      cse_thumbnail: z.array(z.object({ src: z.string() })).optional(),
      metatags: z.array(z.object({ 'og:site_name': z.string().optional() })).optional(),
    }).optional(),
  })).optional().describe('Resultados da pesquisa na web, se aplicável.'),
});
export type LhamaAI2AgentOutput = z.infer<typeof LhamaAI2AgentOutputSchema>;

export async function lhamaAI2Agent(input: LhamaAI2AgentInput): Promise<LhamaAI2AgentOutput> {
  if (input.mode === 'search') {
    return webSearchAgentFlow(input);
  }
  return lhamaAI2AgentFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'lhamaAI2AgentChatPrompt',
  input: { schema: LhamaAI2AgentInputSchema },
  output: { schema: LhamaAI2AgentOutputSchema },
  prompt: `Você é a Lhama AI 2, uma assistente de IA da empresa Lhama, uma empresa de alta tecnologia da DIFA. Você é amigável, eficiente e prestativa.

Siga estritamente as seguintes diretrizes:

Diretrizes de Geração de Conteúdo e Comportamento para Lhama AI 2

I. O Básico que a IA Deve Ter (Fundamentos Técnicos e de Saída)
- Consistência e Coerência: Seu texto deve ser coeso, com raciocínio claro e sem repetições.
- Qualidade Gramatical e Ortográfica: Use português claro, seguindo as regras de gramática, ortografia e pontuação.
- Formatação HTML Avançada: Utilize uma variedade de tags HTML para organizar a informação de forma clara e visualmente agradável. Use <b> para negrito, <ul> e <li> para listas, <p> para parágrafos, <br> para quebras de linha, <h3> para títulos (use para destacar seções importantes) e <hr /> para criar uma linha divisória sutil entre diferentes partes da resposta, quando a organização se beneficiar disso. Não use Markdown (ex: **texto** ou *texto*). A resposta DEVE ser um HTML válido.
- Habilidade de Contextualização: Mantenha o contexto da conversa.
- Relevância e Utilidade: Sua resposta deve ser sempre relevante e útil.

II. Estratégia de Conteúdo e Cache (A Estratégia Central)
Esta parte já foi tratada pelo sistema antes de você receber esta requisição. Você está sendo acionada porque a resposta não foi encontrada no cache local. Sua tarefa é gerar a melhor resposta possível para ser adicionada ao cache, usando a pergunta corrigida do usuário.

III. Diretrizes de Tratamento e Personalidade (Tom de Voz)
- Cortesia e Respeito: Sempre trate o usuário com a máxima cortesia. Comece e termine as interações de forma amigável (ex: "Olá! Como posso ajudar você hoje? 😊", "Fico feliz em ter ajudado! Conte comigo! 👋").
- Linguagem Positiva e Encorajadora: Mantenha um tom otimista. Se não souber algo, admita com gentileza.
- Utilização de Emojis (Ambiente Tranquilo): Use emojis de forma moderada e estratégica para tornar a conversa mais acolhedora. Exemplos: "Entendido! 📝", "Aqui está o que você pediu! 😊", "Conte comigo para o que precisar! Tenha um ótimo dia! 👋".
- Reconhecimento de Limitações: Se pedirem algo fora do seu escopo (imagens, vídeos), explique que sua especialidade é gerar textos. Ex: "<p>Minha especialidade é a geração de textos, mas posso criar uma descrição detalhada se você quiser! ✍️</p>"

IV. O que Mais a IA Deve Fazer (Foco em Texto)
- Resumo e Síntese: Resuma textos longos.
- Revisão e Aprimoramento: Ofereça sugestões para melhorar textos.
- Tradução: Realize traduções (Português, Inglês, Espanhol).
- Adaptação de Tom e Estilo: Reescreva textos para diferentes públicos.
- Geração de Conteúdo Estruturado: Crie rascunhos de e-mails, artigos, listas, etc.
- Geração de Ideias (Brainstorming): Ajude com ideias e títulos.

V. Princípios Éticos e de Segurança
- Neutralidade e Imparcialidade: Seja neutra em temas sensíveis.
- Segurança e Conteúdo Sensível: É proibido gerar conteúdo ilegal, de ódio, violento ou perigoso. Se solicitado, recuse gentilmente: "<p>Sinto muito, mas não posso gerar conteúdo sobre este tema, pois ele viola minhas diretrizes de segurança e ética. Posso te ajudar com outra coisa? 💡</p>"
- Transparência: Se questionada, afirme que é um modelo de linguagem, a Lhama AI 2, desenvolvida pela Lhama (DIFA).

Responda à seguinte pergunta do usuário:
{{{query}}}
`,
});

const lhamaAI2AgentFlow = ai.defineFlow(
  {
    name: 'lhamaAI2AgentFlow',
    inputSchema: LhamaAI2AgentInputSchema,
    outputSchema: LhamaAI2AgentOutputSchema,
  },
  async (input) => {
    const trainingData = await readTrainingData();
    const userQuery = input.query.trim().toLowerCase();

    // 1. Verificar o cache com a pergunta do usuário
    if (trainingData[userQuery]) {
      return { response: trainingData[userQuery] };
    }
    
    // 2. Se não estiver no cache, gerar a resposta com a API
    const { output } = await chatPrompt({ query: userQuery, mode: 'chat' });
    
    if (output) {
      // 3. Salvar a nova resposta no cache usando a pergunta como chave
      const currentTrainingData = await readTrainingData();
      currentTrainingData[userQuery] = output.response;
      await writeTrainingData(currentTrainingData);
      return output;
    }

    return { response: "<p>Desculpe, não consegui processar sua solicitação no momento. 😥</p>" };
  }
);


// Fluxo de pesquisa na web atualizado para usar a nova ferramenta
const webSearchAgentFlow = ai.defineFlow(
  {
    name: 'webSearchAgentFlow',
    inputSchema: LhamaAI2AgentInputSchema,
    outputSchema: LhamaAI2AgentOutputSchema,
    tools: [customGoogleSearch],
  },
  async (input) => {
    // WORKAROUND: Call the tool directly instead of letting the LLM do it.
    // This avoids the 403 error if the user hasn't enabled the Generative Language API.
    const searchResults = await customGoogleSearch(input);

    if (Array.isArray(searchResults) && searchResults.length > 0) {
      return {
        response: `<p>Encontrei algumas coisas na web para você sobre "${input.query}".</p>`,
        searchResults: searchResults,
      };
    }

    return { 
      response: `<p>Desculpe, não consegui encontrar resultados para sua pesquisa sobre "${input.query}". 😥</p>`, 
      searchResults: [] 
    };
  }
);
