"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

type Snippet = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  language: string;
};

interface DashboardClientPageProps {
  snippets: Snippet[];
}

const tagColorMap: { [key: string]: { background: string; text: string } } = {
  javascript: { background: 'hsl(53, 98%, 50%)', text: 'hsl(53, 98%, 10%)' },
  typescript: { background: 'hsl(211, 100%, 50%)', text: 'hsl(0, 0%, 100%)' },
  react: { background: 'hsl(193, 95%, 68%)', text: 'hsl(193, 95%, 10%)' },
  hooks: { background: 'hsl(193, 95%, 68%)', text: 'hsl(193, 95%, 10%)' },
  python: { background: 'hsl(210, 55%, 45%)', text: 'hsl(0, 0%, 100%)' },
  css: { background: 'hsl(21, 89%, 52%)', text: 'hsl(0, 0%, 100%)' },
  nodejs: { background: 'hsl(120, 39%, 49%)', text: 'hsl(0, 0%, 100%)' },
  docker: { background: 'hsl(207, 82%, 53%)', text: 'hsl(0, 0%, 100%)' },
};

function SnippetCard({ snippet }: { snippet: Snippet }) {
  const getTagColors = (tag: string) => {
    const normalizedTag = tag.toLowerCase();
    if (tagColorMap[normalizedTag]) {
      return tagColorMap[normalizedTag];
    }

    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    const background = `hsl(${h}, 50%, 30%)`;
    const text = `hsl(${h}, 100%, 85%)`;
    return { background, text };
  };


  return (
    <Card className="glassmorphic flex flex-col h-full transition-colors duration-300">
      <CardHeader>
        <CardTitle className="font-headline">{snippet.title}</CardTitle>
        <CardDescription>{snippet.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {snippet.tags.map(tag => {
            const { background, text } = getTagColors(tag);
            return (
              <Badge 
                key={tag} 
                style={{ 
                  backgroundColor: background, 
                  color: text,
                  borderColor: background 
                }}
              >
                {tag}
              </Badge>
            )
          })}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">{snippet.language}</p>
      </CardFooter>
    </Card>
  );
}

export default function DashboardClientPage({ snippets }: DashboardClientPageProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top } = grid.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      grid.style.setProperty('--x', `${x}px`);
      grid.style.setProperty('--y', `${y}px`);
    };

    grid.addEventListener('mousemove', handleMouseMove);

    return () => {
      grid.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Your Snippets</h1>
      </div>
      
      <div ref={gridRef} className="card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {snippets.map(snippet => (
          <SnippetCard key={snippet.id} snippet={snippet} />
        ))}
        <Link href="/new-snippet" className="hidden sm:flex w-full">
            <Card className="glassmorphic flex flex-col h-full w-full items-center justify-center border-dashed border-2 hover:border-accent hover:text-accent transition-colors duration-300 min-h-[150px]">
                <div className="text-center">
                    <Plus className="mx-auto h-12 w-12" />
                    <p className="mt-2 font-semibold">Add New Snippet</p>
                </div>
            </Card>
        </Link>
      </div>

       <Link href="/new-snippet" className="sm:hidden fixed bottom-6 right-6">
         <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
            <Plus className="h-8 w-8" />
            <span className="sr-only">New Snippet</span>
         </Button>
       </Link>
    </div>
  );
}
