
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import type { Snippet } from '@/types/snippet';

interface DashboardClientPageProps {
  snippets: Snippet[];
  title?: string;
}

const getLanguageColors = (language: string) => {
    switch (language.toLowerCase()) {
        case 'javascript':
            return { backgroundColor: '#f7df1e', color: '#000000' };
        case 'typescript':
            return { backgroundColor: '#3178c6', color: '#ffffff' };
        case 'python':
            return { backgroundColor: '#3776ab', color: '#ffffff' };
        case 'css':
            return { backgroundColor: '#1572b6', color: '#ffffff' };
        case 'yaml':
             return { backgroundColor: '#cb171e', color: '#ffffff' };
        default:
            return { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' };
    }
};

function SnippetCard({ snippet }: { snippet: Snippet }) {
  const langColors = getLanguageColors(snippet.language);
  return (
    <Card className="glassmorphic flex flex-col h-full transition-all duration-300 ease-in-out hover:border-accent">
      <CardHeader>
        <CardTitle className="font-headline">{snippet.title}</CardTitle>
        <CardDescription>{snippet.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {snippet.tags.map(tag => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Badge style={langColors}>
            {snippet.language}
        </Badge>
      </CardFooter>
    </Card>
  );
}

export default function DashboardClientPage({ snippets, title }: DashboardClientPageProps) {

  return (
    <div className="space-y-8 animate-fade-in-up">
      {snippets.length > 0 ? (
        <>
            {title && <h1 className="text-2xl sm:text-3xl font-bold font-headline mb-4">{title}</h1>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {snippets.map(snippet => (
                <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
            <Link href="/dashboard/new-snippet" className="hidden sm:flex w-full">
                <Card className="glassmorphic flex flex-col h-full w-full items-center justify-center border-dashed border-2 hover:border-accent transition-colors duration-300 min-h-[150px]">
                    <div className="text-center">
                        <Plus className="mx-auto h-12 w-12" />
                        <p className="mt-2 font-semibold">Add New Snippet</p>
                    </div>
                </Card>
            </Link>
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
