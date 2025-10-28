'use server';
/**
 * @fileOverview A flow for generating images using a text prompt.
 * 
 * - imageGenerationFlow - A function that takes a text prompt and returns a generated image URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ImageGenerationOutput } from '@/ai/types';
import { ImageGenerationOutputSchema } from '@/ai/types';

export async function imageGenerationFlow(promptText: string): Promise<ImageGenerationOutput> {
    if (!promptText) {
        throw new Error('Image generation failed because the prompt was empty.');
    }
    
    // Use the AI to generate a URL-friendly slug.
    const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `Create a two-word, hyphen-separated slug in English for an image URL based on the following text: ${promptText}`,
    });

    if (!output || !output.text) {
      throw new Error('Image generation failed because the AI returned an empty response.');
    }
    
    // Create a URL-friendly slug directly from the user's prompt.
    const slug = output.text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!slug) {
        throw new Error('Could not generate a valid slug from the prompt.');
    }

    // Use Unsplash source for more relevant images based on a keyword
    const imageUrl = `https://source.unsplash.com/512x512/?${slug}`;
    
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
