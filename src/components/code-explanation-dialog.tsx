
"use client";

import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, X, FileText, Sparkles, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ExplainCodeOutput } from '@/ai/flows/explain-code';

interface CodeExplanationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    isLoading: boolean;
    result: ExplainCodeOutput | null;
    snippetLanguage: string;
}

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h3 className="font-headline text-xl font-semibold">Analyzing Snippet...</h3>
        <p className="text-muted-foreground">Our AI is working its magic. This might take a moment.</p>
    </div>
);

const ContentDisplay = ({ result, snippetLanguage }: { result: ExplainCodeOutput; snippetLanguage: string; }) => {
    const { theme } = useTheme();
    const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

    return (
        <ScrollArea className="flex-grow h-1 px-6">
            <div className="py-6 space-y-8">
                <div className="space-y-4">
                    <h3 className="font-headline text-xl font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Code Explanation
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{result.explanation}</ReactMarkdown>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-headline text-xl font-semibold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Suggestions for Improvement
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                         <ReactMarkdown
                            components={{
                                code({ node, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return match ? (
                                        <SyntaxHighlighter
                                            style={syntaxTheme}
                                            language={match[1]}
                                            PreTag="div"
                                            className="text-sm my-4 rounded-md"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className="rounded bg-muted px-1.5 py-1 font-mono text-sm" {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {result.review}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
};


export function CodeExplanationDialog({ isOpen, onOpenChange, isLoading, result, snippetLanguage }: CodeExplanationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        AI Analysis
                    </DialogTitle>
                    <DialogDescription>
                        Here's a breakdown and review of the code snippet.
                    </DialogDescription>
                     <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8 rounded-full">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </DialogClose>
                </DialogHeader>

                {isLoading && <LoadingState />}
                {!isLoading && result && <ContentDisplay result={result} snippetLanguage={snippetLanguage} />}

            </DialogContent>
        </Dialog>
    );
}
