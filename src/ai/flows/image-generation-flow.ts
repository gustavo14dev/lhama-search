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
    const { output } = await ai.generate({
        model: 'googleai/gemini-pro-vision',
        prompt: `Generate a photorealistic image of the following: ${promptText}`,
    });

    const imageUrl = output?.toString();

    if (!imageUrl) {
        throw new Error('Image generation failed to return a URL.');
    }

    // Assuming the model returns a data URI or a URL, which needs to be handled.
    // For now, let's assume it returns a string that can be used as a src.
    // This might need adjustment based on the actual model output format.
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
