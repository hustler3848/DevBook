
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Snippet } from '@/types/snippet';
import { SnippetCard } from '@/components/snippet-card';

interface DashboardClientPageProps {
  snippets: Snippet[];
  title?: string;
  collectionType?: 'my-snippets' | 'saved' | 'starred';
  onUnsave?: (snippetId: string) => void;
  onUnstar?: (snippetId: string) => void;
  onDelete?: (snippetId: string) => void;
  onToggleStar?: (snippet: Snippet) => void;
  onToggleSave?: (snippet: Snippet) => void;
}


export default function DashboardClientPage({ snippets, title, collectionType, onUnsave, onUnstar, onDelete, onToggleSave, onToggleStar }: DashboardClientPageProps) {

  const handleToggle = (snippet: Snippet) => {
    if (collectionType === 'saved' && onToggleSave) {
      onToggleSave(snippet);
    } else if (collectionType === 'starred' && onToggleStar) {
      onToggleStar(snippet);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {title && snippets.length > 0 && <h1 className="text-2xl sm:text-3xl font-bold font-headline mb-4">{title}</h1>}
      {snippets.length > 0 ? (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
         <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No Snippets Yet</h2>
            <p className="text-muted-foreground mt-2 mb-4">You haven't created any snippets. Get started by adding one!</p>
            <Button asChild>
                <Link href="/dashboard/new-snippet">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Snippet
                </Link>
            </Button>
         </div>
      )}
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
    </div>
    
  );
}

// Need a placeholder Card for the "Add New" button to avoid layout shifts.
function Card({ className, children }: { className: string, children: React.ReactNode }) {
    return <div className={className}>{children}</div>
}
