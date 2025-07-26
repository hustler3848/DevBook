
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Compass } from 'lucide-react';
import type { Snippet } from '@/types/snippet';
import { SnippetCard } from '@/components/snippet-card';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { SnippetViewDialog } from '@/components/snippet-view-dialog';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { starSnippet, unstarSnippet, saveSnippet, unsaveSnippet } from '@/lib/firebase/firestore';


interface DashboardClientPageProps {
  snippets: Snippet[];
  title?: string;
  collectionType?: 'my-snippets' | 'saved' | 'starred' | 'explore' | 'public-profile';
  onUnsave?: (snippetId: string) => void;
  onUnstar?: (snippetId: string) => void;
  onDelete?: (snippetId: string) => void;
}

const emptyStateConfig = {
    'my-snippets': {
        title: "No Snippets Yet",
        description: "You haven't created any snippets. Get started by adding one!",
        buttonText: "Create Your First Snippet",
        buttonLink: "/dashboard/new-snippet",
        icon: Plus
    },
    'saved': {
        title: "No Saved Snippets",
        description: "You haven't saved any snippets yet. Explore the community to find some!",
        buttonText: "Explore Snippets",
        buttonLink: "/dashboard/explore",
        icon: Compass
    },
    'starred': {
        title: "No Starred Snippets",
        description: "You haven't starred any snippets yet. Star your favorites to see them here.",
        buttonText: "Explore Snippets",
        buttonLink: "/dashboard/explore",
        icon: Compass
    },
    'public-profile': {
        title: "No Public Snippets",
        description: "This user hasn't shared any public snippets yet.",
        buttonText: null,
        buttonLink: null,
        icon: null,
    },
    'explore': {
        title: "No Snippets Found",
        description: "Try adjusting your search or filter.",
        buttonText: null,
        buttonLink: null,
        icon: null,
    }
}

export default function DashboardClientPage({ snippets: initialSnippets, title, collectionType = 'explore', onDelete, onUnsave, onUnstar }: DashboardClientPageProps) {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleToggleStar = async (snippet: Snippet) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Please login to star snippets.' });
        return;
    }

    if (collectionType === 'starred' && onUnstar) {
      onUnstar(snippet.id);
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
            await starSnippet(user.uid, snippet);
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

    if (collectionType === 'saved' && onUnsave) {
        onUnsave(snippet.id);
        return;
    }

    const wasSaved = snippet.isSaved;
    const newSavedState = !wasSaved;
    updateSnippetState(snippet.id, { isSaved: newSavedState });

    try {
        if (wasSaved) {
            await unsaveSnippet(user.uid, snippet.id);
        } else {
            await saveSnippet(user.uid, snippet);
        }
    } catch (error) {
        updateSnippetState(snippet.id, { isSaved: wasSaved });
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update save status.'});
    }
  };
  
  const updateSnippetState = (id: string, updates: Partial<Snippet>) => {
    const updater = (prev: Snippet[]) => prev.map(s => s.id === id ? { ...s, ...updates } : s);
    setSnippets(updater);
    if (selectedSnippet && selectedSnippet.id === id) {
        setSelectedSnippet(prev => prev ? {...prev, ...updates} : null);
    }
  };
  
  const currentEmptyState = emptyStateConfig[collectionType];
  const EmptyIcon = currentEmptyState?.icon;

  return (
    <>
        <div className="space-y-8 animate-fade-in-up">
        {title && <h1 className="text-2xl sm:text-3xl font-bold font-headline mb-4">{title}</h1>}
        {snippets.length > 0 ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {snippets.map(snippet => (
                    <SnippetCard 
                        key={snippet.id} 
                        snippet={snippet} 
                        collectionType={collectionType} 
                        onDelete={onDelete} 
                        onToggleSave={handleToggleSave}
                        onToggleStar={handleToggleStar}
                        onSelect={setSelectedSnippet}
                    />
                ))}
                {collectionType === 'my-snippets' && (
                    <Link href="/dashboard/new-snippet" className="hidden sm:flex w-full">
                        <Card className="glassmorphic flex flex-col h-full w-full items-center justify-center border-dashed border-2 hover:border-accent transition-colors duration-300 min-h-[150px]">
                            <div className="text-center">
                                <Plus className="mx-auto h-12 w-12" />
                                <p className="mt-2 font-semibold">Add New Snippet</p>
                            </div>
                        </Card>
                    </Link>
                )}
                </div>
            </>
        ) : (
            currentEmptyState && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card/50">
                {EmptyIcon && <EmptyIcon className="w-12 h-12 mb-4 text-muted-foreground" />}
                <h2 className="text-xl font-semibold">{currentEmptyState.title}</h2>
                <p className="text-muted-foreground mt-2 mb-4">{currentEmptyState.description}</p>
                {currentEmptyState.buttonText && currentEmptyState.buttonLink && EmptyIcon && (
                    <Button asChild>
                        <Link href={currentEmptyState.buttonLink}>
                            <EmptyIcon className="mr-2 h-4 w-4" />
                            {currentEmptyState.buttonText}
                        </Link>
                    </Button>
                )}
            </div>
            )
        )}
        {collectionType === 'my-snippets' && (
            <Link
                href="/dashboard/new-snippet"
                className="sm:hidden fixed bottom-4 right-4 z-50"
            >
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-8 w-8" />
                    <span className="sr-only">New Snippet</span>
                </Button>
            </Link>
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
    </>
  );
}
