
"use client";

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, X, FileText, Sparkles, Lightbulb, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ExplainCodeOutput } from '@/app/actions/explain-code-action';
import { useToast } from '@/hooks/use-toast';

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

const ContentDisplay = ({ result }: { result: ExplainCodeOutput; }) => {
    const { theme } = useTheme();
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
    const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

    const handleCopy = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setIsCopied({ ...isCopied, [index]: true });
        toast({ title: "Copied suggestion to clipboard!" });
        setTimeout(() => setIsCopied(prev => ({...prev, [index]: false})), 2000);
    }
    
    return (
        <ScrollArea className="flex-grow h-1">
            <div className="py-6 px-6 space-y-8">
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
                                        <div className="relative my-4 rounded-lg border bg-background overflow-hidden">
                                            <SyntaxHighlighter
                                                style={syntaxTheme}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{ 
                                                    margin: 0,
                                                    padding: '1rem',
                                                    background: 'transparent',
                                                    fontSize: '13px'
                                                }}
                                                className="custom-scrollbar"
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                            <Button 
                                                size="icon" 
                                                variant="secondary" 
                                                className="absolute top-2 right-2 h-8 w-8"
                                                onClick={() => handleCopy(String(children).replace(/\n$/, ''), (props as any).index)}
                                            >
                                                {isCopied[(props as any).index] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                <span className="sr-only">Copy code</span>
                                            </Button>
                                        </div>
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


export function CodeExplanationDialog({ isOpen, onOpenChange, isLoading, result }: CodeExplanationDialogProps) {
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
                {!isLoading && result && <ContentDisplay result={result} />}

            </DialogContent>
        </Dialog>
    );
}
