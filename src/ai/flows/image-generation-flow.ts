'use server';
/**
 * @fileOverview A flow for generating images using a text prompt.
 * 
 * - imageGenerationFlow - A function that takes a text prompt and returns a generated image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ImageGenerationOutput } from '@/ai/types';
import { ImageGenerationOutputSchema } from '@/ai/types';

export async function imageGenerationFlow(promptText: string): Promise<ImageGenerationOutput> {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: promptText,
    });

    const imageUrl = media.url;
    if (!imageUrl) {
        throw new Error('Image generation failed to return a URL.');
    }

    return { imageUrl };
}

// Define a flow for completeness, even though we call the generation directly.
// This makes it visible in the Genkit developer UI.
ai.defineFlow(
  {
    name: 'imageGenerationFlow',
    inputSchema: z.string(),
    outputSchema: ImageGenerationOutputSchema,
  },
  async (prompt) => {
    return await imageGenerationFlow(prompt);
  }
);
