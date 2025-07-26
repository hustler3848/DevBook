
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Compass } from 'lucide-react';
import type { Snippet } from '@/types/snippet';
import { SnippetCard } from '@/components/snippet-card';
import { Card } from '@/components/ui/card';

interface DashboardClientPageProps {
  snippets: Snippet[];
  title?: string;
  collectionType?: 'my-snippets' | 'saved' | 'starred' | 'explore' | 'public-profile';
  onUnsave?: (snippetId: string) => void;
  onUnstar?: (snippetId: string) => void;
  onDelete?: (snippetId: string) => void;
  onToggleStar?: (snippet: Snippet) => void;
  onToggleSave?: (snippet: Snippet) => void;
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

export default function DashboardClientPage({ snippets, title, collectionType = 'explore', onDelete, onToggleSave, onToggleStar }: DashboardClientPageProps) {

  const handleToggle = (snippet: Snippet) => {
    if (collectionType === 'saved' && onToggleSave) {
      onToggleSave(snippet);
    } else if (collectionType === 'starred' && onToggleStar) {
      onToggleStar(snippet);
    }
  }
  
  const currentEmptyState = emptyStateConfig[collectionType];
  const EmptyIcon = currentEmptyState?.icon;

  return (
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
                    onToggleSave={onToggleSave}
                    onToggleStar={onToggleStar}
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
    
  );
}
