'use server';
/**
 * @fileOverview Lhama AI 2 agent, a default AI agent for the Lhama Search platform.
 *
 * - lhamaAI2Agent - A function that processes user queries and returns AI-generated responses.
 * - LhamaAI2AgentInput - The input type for the lhamaAI2Agent function.
 * - LhamaAI2AgentOutput - The return type for the lhamaAI2Agent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LhamaAI2AgentInputSchema = z.object({
  query: z.string().describe('The user query to be processed by the AI agent.'),
});
export type LhamaAI2AgentInput = z.infer<typeof LhamaAI2AgentInputSchema>;

const LhamaAI2AgentOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user query.'),
});
export type LhamaAI2AgentOutput = z.infer<typeof LhamaAI2AgentOutputSchema>;

export async function lhamaAI2Agent(input: LhamaAI2AgentInput): Promise<LhamaAI2AgentOutput> {
  return lhamaAI2AgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lhamaAI2AgentPrompt',
  input: {schema: LhamaAI2AgentInputSchema},
  output: {schema: LhamaAI2AgentOutputSchema},
  prompt: `You are Lhama AI 2, a helpful and friendly AI assistant. Respond to the following user query:

{{{query}}} `,
});

const lhamaAI2AgentFlow = ai.defineFlow(
  {
    name: 'lhamaAI2AgentFlow',
    inputSchema: LhamaAI2AgentInputSchema,
    outputSchema: LhamaAI2AgentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
