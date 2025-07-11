
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Heart, Bookmark, Copy, Star, Check } from 'lucide-react';
import type { Snippet } from '@/app/dashboard/explore/page';
import { useToast } from '@/hooks/use-toast';

interface SnippetViewDialogProps {
  snippet: Snippet;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SnippetViewDialog({ snippet, isOpen, onOpenChange }: SnippetViewDialogProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippet.code);
    setIsCopied(true);
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
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <ScrollArea className="h-full w-full">
          <div className="p-8">
            <header className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={snippet.avatar} alt={snippet.author} data-ai-hint={snippet.dataAiHint}/>
                  <AvatarFallback>{snippet.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-headline text-2xl font-bold">{snippet.title}</h2>
                  <p className="text-muted-foreground">by {snippet.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Bookmark className="h-5 w-5" />
                </Button>
                <Button onClick={handleCopyCode} size="icon" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity w-10 h-10">
                  {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5"/>}
                  <span className="sr-only">Copy Code</span>
                </Button>
              </div>
            </header>
            
            <main>
              <div className="rounded-lg border bg-background overflow-hidden">
                <SyntaxHighlighter
                  language={snippet.language.toLowerCase()}
                  style={syntaxTheme}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: 'transparent',
                    maxHeight: '50vh',
                    fontSize: '14px',
                  }}
                  className="custom-scrollbar"
                  codeTagProps={{ className: "font-code" }}
                >
                  {snippet.code}
                </SyntaxHighlighter>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                    <h3 className="font-headline text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{snippet.description}</p>
                </div>
                <div>
                    <h3 className="font-headline text-lg font-semibold mb-2">Details</h3>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{formatStars(snippet.stars)} stars</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span>{snippet.language}</span>
                        </div>
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
