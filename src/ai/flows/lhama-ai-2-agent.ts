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
    // If the file doesn't exist, return an empty object
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

const LhamaAI2AgentInputSchema = z.object({
  query: z.string().describe('A pergunta do usuário a ser processada pelo agente de IA.'),
});
export type LhamaAI2AgentInput = z.infer<typeof LhamaAI2AgentInputSchema>;

const LhamaAI2AgentOutputSchema = z.object({
  response: z.string().describe('A resposta gerada pela IA para a pergunta do usuário, formatada em HTML.'),
});
export type LhamaAI2AgentOutput = z.infer<typeof LhamaAI2AgentOutputSchema>;

export async function lhamaAI2Agent(input: LhamaAI2AgentInput): Promise<LhamaAI2AgentOutput> {
  return lhamaAI2AgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lhamaAI2AgentPrompt',
  input: { schema: LhamaAI2AgentInputSchema },
  output: { schema: LhamaAI2AgentOutputSchema },
  prompt: `Você é a Lhama AI 2, uma assistente de IA da empresa Lhama, uma empresa de alta tecnologia da DIFA. Você é amigável, eficiente e prestativa.

Siga estritamente as seguintes diretrizes:

Diretrizes de Geração de Conteúdo e Comportamento para Lhama AI 2

I. O Básico que a IA Deve Ter (Fundamentos Técnicos e de Saída)
- Consistência e Coerência: Seu texto deve ser coeso, com raciocínio claro e sem repetições.
- Qualidade Gramatical e Ortográfica: Use português claro, seguindo as regras de gramática, ortografia e pontuação.
- Foco em Texto e Formatação: Use formatação HTML (<b>, <ul>, <li>, <p>, <br>, <h3>, <hr />) para organizar a informação. Não use Markdown (ex: **texto** ou *texto*). A resposta DEVE ser um HTML válido.
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

const correctionPrompt = ai.definePrompt({
  name: 'correctionPrompt',
  input: { schema: z.object({ query: z.string() }) },
  output: { schema: z.object({ correctedQuery: z.string() }) },
  prompt: `Corrija e reescreva a seguinte pergunta do usuário para que ela fique gramaticalmente correta e clara, preservando a intenção original. Se a pergunta já estiver correta, apenas a repita. Responda APENAS com a pergunta corrigida.

Pergunta original: "{{{query}}}"`,
});


const lhamaAI2AgentFlow = ai.defineFlow(
  {
    name: 'lhamaAI2AgentFlow',
    inputSchema: LhamaAI2AgentInputSchema,
    outputSchema: LhamaAI2AgentOutputSchema,
  },
  async (input) => {
    const trainingData = await readTrainingData();

    // 1. Corrigir a pergunta do usuário
    const correctionResult = await correctionPrompt(input);
    const correctedQuery = correctionResult.output?.correctedQuery.trim().toLowerCase() || input.query.trim().toLowerCase();

    // 2. Verificar o cache com a pergunta corrigida
    if (trainingData[correctedQuery]) {
      return { response: trainingData[correctedQuery] };
    }
    
    // 3. Se não estiver no cache, gerar a resposta com a API
    const { output } = await prompt({ query: correctedQuery });
    
    if (output) {
      // 4. Salvar a nova resposta no cache usando a pergunta corrigida como chave
      const currentTrainingData = await readTrainingData();
      currentTrainingData[correctedQuery] = output.response;
      await writeTrainingData(currentTrainingData);
      return output;
    }

    return { response: "<p>Desculpe, não consegui processar sua solicitação no momento. 😥</p>" };
  }
);
