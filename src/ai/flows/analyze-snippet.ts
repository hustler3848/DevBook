
'use server';

/**
 * @fileOverview Analyzes a code snippet to generate a title, description, tags, and detect the language.
 *
 * - analyzeSnippet - A function that handles the snippet analysis process.
 * - AnalyzeSnippetInput - The input type for the analyzeSnippet function.
 * - AnalyzeSnippetOutput - The return type for the analyzeSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSnippetInputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The code snippet to analyze.'),
});
export type AnalyzeSnippetInput = z.infer<typeof AnalyzeSnippetInputSchema>;

const AnalyzeSnippetOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the code snippet (e.g., "React Debounce Hook").'),
  description: z.string().describe('A one or two-sentence description of what the code does and its purpose.'),
  tags: z.array(z.string()).describe('An array of 5 to 8 relevant tags (e.g., react, hooks, auth).'),
  language: z.string().describe('The programming language of the code snippet (e.g., TypeScript, Python).'),
});
export type AnalyzeSnippetOutput = z.infer<typeof AnalyzeSnippetOutputSchema>;

export async function analyzeSnippet(input: AnalyzeSnippetInput): Promise<AnalyzeSnippetOutput> {
  return analyzeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSnippetPrompt',
  input: {schema: AnalyzeSnippetInputSchema},
  output: {schema: AnalyzeSnippetOutputSchema},
  prompt: `You are an expert software developer who helps users document their code snippets.
  Analyze the following code snippet and provide the following:
  1. A short, descriptive title for the snippet.
  2. A one or two-sentence description of what the code does.
  3. Between 5 and 8 relevant tags for categorization.
  4. The programming language of the code.

  Code Snippet:
  {{codeSnippet}}

  Return the result in a valid JSON object matching the required schema.`,
});

const analyzeSnippetFlow = ai.defineFlow(
  {
    name: 'analyzeSnippetFlow',
    inputSchema: AnalyzeSnippetInputSchema,
    outputSchema: AnalyzeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
