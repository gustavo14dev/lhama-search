/**
 * @fileOverview Centralized type definitions for AI flows.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema for Image Generation Flow
export const ImageGenerationOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type ImageGenerationOutput = z.infer<typeof ImageGenerationOutputSchema>;


// Tool for Google Custom Search
export const customGoogleSearch = ai.defineTool(
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


// Schemas for Lhama AI 2 Agent
export const LhamaAI2AgentInputSchema = z.object({
  query: z.string().describe('A pergunta do usuário a ser processada pelo agente de IA.'),
  mode: z.enum(['chat', 'search']).default('chat').describe('O modo de operação: "chat" para conversa padrão ou "search" para pesquisa na web.'),
  imageDataUri: z.string().optional().describe("A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type LhamaAI2AgentInput = z.infer<typeof LhamaAI2AgentInputSchema>;

export const LhamaAI2AgentOutputSchema = z.object({
  response: z.string().describe('A resposta gerada pela IA para a pergunta do usuário, formatada em HTML.'),
  isImage: z.boolean().optional().describe('Flag para indicar se a resposta é uma imagem.'),
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
