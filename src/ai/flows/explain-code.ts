
'use server';

/**
 * @fileOverview Provides AI-driven explanation and review for a given code snippet.
 *
 * - explainAndReviewCode - A function that analyzes a snippet and returns an explanation and review.
 * - ExplainCodeInput - The input type for the function.
 * - ExplainCodeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain and review.'),
  language: z.string().describe('The programming language of the snippet.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z.string().describe("A detailed but easy-to-understand explanation of the code. Use markdown for formatting, including bullet points for key concepts."),
  review: z.string().describe("A constructive review of the code, suggesting improvements for performance, readability, or best practices. Provide corrected code blocks using markdown fences where applicable."),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainAndReviewCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: {schema: ExplainCodeInputSchema},
  output: {schema: ExplainCodeOutputSchema},
  prompt: `You are a world-class software engineering expert and a senior code reviewer at Google.
  Your task is to analyze a given code snippet and provide a clear explanation and a constructive review.

  Language: {{{language}}}
  Code Snippet:
  \`\`\`
  {{{codeSnippet}}}
  \`\`\`

  1.  **Explanation**:
      -   Start with a one-sentence summary of what the code does.
      -   Explain the core concepts and logic in a simple, easy-to-understand way.
      -   Use markdown, such as bullet points, to break down complex parts.

  2.  **Code Review**:
      -   Identify areas for improvement. This could include performance, readability, security, or modern best practices.
      -   Provide specific, actionable suggestions.
      -   When suggesting code changes, include the corrected code block using markdown fences with the correct language identifier.

  Return the result in a valid JSON object matching the required schema.`,
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
