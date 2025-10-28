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
        model: 'googleai/gemini-pro',
        prompt: `Based on the following prompt, generate a short, descriptive, URL-friendly slug for an image. For example, if the prompt is "a majestic lion in the savanna at sunset", a good slug would be "majestic-lion-savanna-sunset". Just return the slug and nothing else. Prompt: ${promptText}`,
    });

    const slug = output?.toString().trim().replace(/\s+/g, '-');

    if (!slug) {
        throw new Error('Image description generation failed.');
    }

    // Use a placeholder service to generate an image URL based on the slug.
    const imageUrl = `https://placehold.co/512x512/png?text=${encodeURIComponent(slug)}`;
    
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
