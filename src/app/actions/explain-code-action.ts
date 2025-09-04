
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain and review.'),
  language: z.string().describe('The programming language of the snippet.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z.string().describe("A brief, one to two-sentence explanation of the code. Use markdown for formatting."),
  review: z.string().describe("A constructive review of the code, suggesting 1-2 key improvements for performance, readability, or best practices. Provide corrected code blocks using markdown fences where applicable. Keep it concise."),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;


export async function explainAndReviewCodeAction(input: ExplainCodeInput): Promise<ExplainCodeOutput | null> {
    const validatedInput = ExplainCodeInputSchema.safeParse(input);
    if (!validatedInput.success) {
        throw new Error('Invalid input');
    }
    const { codeSnippet, language } = validatedInput.data;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        const prompt = `You are a world-class software engineering expert and a senior code reviewer at Google.
        Your task is to analyze a given code snippet and provide a clear, concise explanation and a constructive review.

        Language: ${language}
        Code Snippet:
        \`\`\`${language}
        ${codeSnippet}
        \`\`\`

        1.  **Explanation**:
            -   Provide a brief, one to two-sentence summary of what the code does.

        2.  **Code Review**:
            -   Identify 1-2 critical areas for improvement (e.g., performance, readability, security).
            -   Provide specific, actionable suggestions. Keep them concise.
            -   When suggesting code changes, include the corrected code block using markdown fences with the correct language identifier.

        Return the result in a valid JSON object matching this schema: ${JSON.stringify(ExplainCodeOutputSchema.shape)}. Be brief.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const parsedResult = JSON.parse(text);
        const validatedOutput = ExplainCodeOutputSchema.safeParse(parsedResult);

        if (validatedOutput.success) {
            return validatedOutput.data;
        } else {
            console.error("AI output validation failed:", validatedOutput.error);
            return null;
        }
    } catch(error) {
        console.error("Error calling Google AI:", error);
        return null;
    }
}
