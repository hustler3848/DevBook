
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

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


export async function analyzeSnippetAction(input: AnalyzeSnippetInput): Promise<AnalyzeSnippetOutput | null> {
    const validatedInput = AnalyzeSnippetInputSchema.safeParse(input);
    if (!validatedInput.success) {
        throw new Error('Invalid input');
    }
    const { codeSnippet } = validatedInput.data;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        const prompt = `You are an expert software developer who helps users document their code snippets.
        Analyze the following code snippet and provide the following:
        1. A short, descriptive title for the snippet.
        2. A one or two-sentence description of what the code does.
        3. Between 5 and 8 relevant tags for categorization.
        4. The programming language of the code.

        Code Snippet:
        \`\`\`
        ${codeSnippet}
        \`\`\`

        Return the result in a valid JSON object matching this schema: ${JSON.stringify(AnalyzeSnippetOutputSchema.shape)}.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const parsedResult = JSON.parse(text);
        const validatedOutput = AnalyzeSnippetOutputSchema.safeParse(parsedResult);

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
