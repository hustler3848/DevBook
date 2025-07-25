
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Heart, Bookmark, Copy, Star, Check, X } from 'lucide-react';
import type { Snippet } from '@/types/snippet';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SnippetViewDialogProps {
  snippet: Snippet;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onToggleStar: (snippet: Snippet) => void;
  onToggleSave: (snippet: Snippet) => void;
}

export function SnippetViewDialog({ snippet, isOpen, onOpenChange, onToggleStar, onToggleSave }: SnippetViewDialogProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
        setIsCopied(false);
    }
  },[isOpen]);

  const handleCopyCode = () => {
    if(!snippet.codeSnippet) return;
    navigator.clipboard.writeText(snippet.codeSnippet);
    setIsCopied(true);
    toast({
        title: "Copied to clipboard!",
        description: "You can now paste the code in your editor.",
    });
    setTimeout(() => setIsCopied(false), 2000); // Revert back to copy icon after 2 seconds
  };

  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

  if (!mounted) {
    return null; // or a skeleton loader if preferred
  }

  const formatStars = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={snippet.avatar} alt={snippet.author} data-ai-hint={snippet.dataAiHint}/>
                  <AvatarFallback>{snippet.author?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="font-headline text-xl sm:text-2xl font-bold">{snippet.title}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">by {snippet.author}</DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => onToggleStar(snippet)}>
                                <Star className={cn("h-5 w-5", snippet.isStarred && "text-yellow-400 fill-yellow-400")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{snippet.isStarred ? 'Unstar' : 'Star'}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => onToggleSave(snippet)}>
                                <Bookmark className={cn("h-5 w-5", snippet.isSaved && "text-primary fill-primary")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{snippet.isSaved ? 'Unsave' : 'Save'}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Button onClick={handleCopyCode} size="icon" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity w-10 h-10">
                  {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5"/>}
                  <span className="sr-only">Copy Code</span>
                </Button>
                 <DialogClose asChild>
                    <button className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                 </DialogClose>
              </div>
            </div>
        </DialogHeader>

        <ScrollArea className="h-full w-full">
          <div className="p-4 sm:p-6">
            <main>
              <div className="rounded-lg border bg-background overflow-hidden">
                <SyntaxHighlighter
                  language={snippet.language.toLowerCase()}
                  style={syntaxTheme}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'transparent',
                    maxHeight: 'calc(90vh - 300px)',
                    fontSize: '14px',
                  }}
                  className="custom-scrollbar"
                  codeTagProps={{ className: "font-code" }}
                >
                  {snippet.codeSnippet || ''}
                </SyntaxHighlighter>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                    <h3 className="font-headline text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{snippet.description}</p>
                </div>
                <div>
                    <h3 className="font-headline text-lg font-semibold mb-2">Details</h3>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{formatStars(snippet.starCount || 0)} stars</span>
                        </div>
                        <Badge variant="secondary">{snippet.language}</Badge>
                    </div>
                </div>
                <div>
                    <h3 className="font-headline text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {snippet.tags.map(tag => (
                            <Badge key={tag} variant="secondary">
                            {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
              </div>
            </main>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
