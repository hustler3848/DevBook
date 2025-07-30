
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getTrendingSnippets } from '@/lib/firebase/firestore';
import type { Snippet } from '@/types/snippet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { SnippetViewDialog } from '../snippet-view-dialog';
import { useAuth } from '@/context/auth-context';
import { starSnippet, unstarSnippet, saveSnippet, unsaveSnippet } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"


function SnippetPreviewCard({ snippet, onSelect }: { snippet: Snippet; onSelect: (snippet: Snippet) => void; }) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const syntaxTheme = theme === 'dark' ? oneDark : oneLight;
    
    const truncatedCode = snippet.codeSnippet.split('\n').slice(0, 7).join('\n');

    if (!mounted) {
        return <SnippetCardSkeleton />;
    }

    return (
        <div className="glassmorphic rounded-lg flex flex-col h-full overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2">
            <div className="p-4 space-y-3">
                <h3 className="font-headline text-lg font-semibold truncate">{snippet.title}</h3>
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={snippet.avatar} alt={snippet.author} />
                        <AvatarFallback>{snippet.author?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">@{snippet.authorUsername}</span>
                </div>
            </div>
            <div className="relative px-4">
                 <div className={cn("rounded-lg overflow-hidden text-sm", theme === 'dark' ? 'bg-black/10' : 'bg-gray-50/50')}>
                    <SyntaxHighlighter
                        language={snippet.language?.toLowerCase()}
                        style={syntaxTheme}
                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                        className="custom-scrollbar h-[150px]"
                        codeTagProps={{className: "font-code text-xs"}}
                    >
                        {truncatedCode}
                    </SyntaxHighlighter>
                 </div>
                 <div className="absolute bottom-0 left-4 right-4 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
            </div>
            <div className="p-4 mt-auto flex justify-between items-center">
                <Badge variant="secondary">{snippet.language}</Badge>
                <Button variant="ghost" onClick={() => onSelect(snippet)}>View Full Snippet</Button>
            </div>
        </div>
    );
}

const SnippetCardSkeleton = () => {
    return (
        <div className="flex-shrink-0 w-full">
            <div className="bg-card/60 rounded-lg flex flex-col h-full p-4">
                 <Skeleton className="h-6 w-3/4 mb-3" />
                 <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-1/4" />
                 </div>
                 <Skeleton className="h-[150px] w-full" />
                 <div className="mt-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-8 w-1/2" />
                 </div>
            </div>
        </div>
    );
}

export function TrendingSnippets() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const fetchSnippets = async () => {
            setIsLoading(true);
            try {
                const trendingSnippets = await getTrendingSnippets();
                setSnippets(trendingSnippets);
            } catch (error) {
                console.error("Failed to fetch trending snippets:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not load trending snippets.'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSnippets();
    }, [toast]);
    
    const updateSnippetState = (id: string, updates: Partial<Snippet>) => {
        const updater = (prev: Snippet[]) => prev.map(s => s.id === id ? { ...s, ...updates } : s);
        setSnippets(updater);
        if (selectedSnippet && selectedSnippet.id === id) {
            setSelectedSnippet(prev => prev ? {...prev, ...updates} : null);
        }
    };
    
    const handleToggleStar = async (snippet: Snippet) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Please login to star snippets.' });
            return;
        }
        const wasStarred = snippet.isStarred;
        const newStarredState = !wasStarred;
        const newStarCount = wasStarred ? (snippet.starCount || 1) - 1 : (snippet.starCount || 0) + 1;

        updateSnippetState(snippet.id, { isStarred: newStarredState, starCount: newStarCount });
        
        try {
            if (wasStarred) {
                await unstarSnippet(user.uid, snippet.id);
            } else {
                await starSnippet(user.uid, snippet.id);
            }
        } catch (error) {
            updateSnippetState(snippet.id, { isStarred: wasStarred, starCount: snippet.starCount });
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update star status.'});
        }
    };

    const handleToggleSave = async (snippet: Snippet) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Please login to save snippets.' });
            return;
        }
        const wasSaved = snippet.isSaved;
        const newSavedState = !wasSaved;
        updateSnippetState(snippet.id, { isSaved: newSavedState });

        try {
            if (wasSaved) {
                await unsaveSnippet(user.uid, snippet.id);
            } else {
                await saveSnippet(user.uid, snippet.id);
            }
        } catch (error) {
            updateSnippetState(snippet.id, { isSaved: wasSaved });
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update save status.'});
        }
    };


    return (
         <section className="py-16 sm:py-24">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">Trending Snippets</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Discover the most popular and useful code snippets shared by our community.
                    </p>
                </div>

                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                  <SnippetCardSkeleton />
                                </CarouselItem>
                            ))
                        ) : (
                            snippets.map(snippet => (
                                <CarouselItem key={snippet.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                  <SnippetPreviewCard snippet={snippet} onSelect={setSelectedSnippet} />
                                </CarouselItem>
                            ))
                        )}
                    </CarouselContent>
                </Carousel>
                
                 {snippets.length > 0 && (
                    <div className="text-center mt-12">
                        <Button asChild size="lg">
                            <Link href="/dashboard/explore">
                                Explore All Snippets
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

             {selectedSnippet && (
                <SnippetViewDialog
                    snippet={selectedSnippet}
                    isOpen={!!selectedSnippet}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setSelectedSnippet(null);
                        }
                    }}
                    onToggleStar={() => handleToggleStar(selectedSnippet)}
                    onToggleSave={() => handleToggleSave(selectedSnippet)}
                />
            )}
        </section>
    );
}
