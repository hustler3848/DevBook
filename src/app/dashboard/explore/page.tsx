
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SnippetViewDialog } from '@/components/snippet-view-dialog';
import ExploreLoading from './loading';
import { useAuth } from '@/context/auth-context';
import { starSnippet, unstarSnippet, saveSnippet, unsaveSnippet, getUserInteractionStatus } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Snippet } from '@/types/snippet';
import { SnippetCard } from '@/components/snippet-card';


const initialCommunitySnippets: Snippet[] = [
  { 
    id: 'community-1', 
    title: 'Custom Framer Motion Animation', 
    description: 'A reusable animation variant for stunning enter effects. This is a very common pattern when working with Framer Motion and can be easily extended to include more complex animations and transitions.', 
    tags: ['framer-motion', 'react', 'animation', 'variants', 'ui'], 
    language: 'TypeScript',
    author: 'Elena Petrova',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman developer',
    starCount: 1200,
    isStarred: false,
    isSaved: false,
    codeSnippet: `export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};`
  },
  { 
    id: 'community-2', 
    title: 'Drizzle ORM Schema', 
    description: 'Example schema for a posts and users table using Drizzle. Drizzle ORM provides a type-safe SQL-like experience for TypeScript projects, making database interactions safer and more predictable.', 
    tags: ['drizzle', 'orm', 'database', 'typescript'], 
    language: 'TypeScript',
    author: 'John Smith',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'man developer',
    starCount: 876,
    isStarred: false,
    isSaved: false,
    codeSnippet: `import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
});`
  },
  { 
    id: 'community-3', 
    title: 'Tailwind CSS Plugin', 
    description: 'A simple plugin to add custom utilities for text shadows. Tailwind plugins are a powerful way to extend the framework with your own styles and logic.', 
    tags: ['tailwindcss', 'css', 'plugin'], 
    language: 'JavaScript',
    author: 'Emily White',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman coder',
    starCount: 2300,
    isStarred: false,
    isSaved: false,
    codeSnippet: `const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addUtilities }) {
  const newUtilities = {
    '.text-shadow': {
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    },
  }
  addUtilities(newUtilities)
})`
  },
  { 
    id: 'community-4', 
    title: 'Python Data Class', 
    description: 'A simple dataclass for representing a user with roles. Dataclasses are a feature in Python that automatically generates special methods like __init__(), __repr__(), and more.', 
    tags: ['python', 'dataclass'], 
    language: 'Python',
    author: 'Chen Wei',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'asian developer',
    starCount: 950,
    isStarred: false,
    isSaved: false,
    codeSnippet: `from dataclasses import dataclass, field
from typing import List

@dataclass
class User:
    username: str
    roles: List[str] = field(default_factory=list)`
  },
  {
    id: 'community-5',
    title: 'Async Rust with Tokio',
    description: 'A basic TCP echo server implemented using Tokio, the asynchronous runtime for Rust. This example demonstrates how to bind a listener and accept incoming connections.',
    tags: ['rust', 'async', 'tokio', 'networking'],
    language: 'Rust',
    author: 'Alex Johnson',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'male programmer',
    starCount: 1500,
    isStarred: false,
    isSaved: false,
    codeSnippet: `use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    let (mut socket, _) = listener.accept().await?;
    // ...
}`
  },
  {
    id: 'community-6',
    title: 'Go Gin Middleware',
    description: 'A custom logging middleware for the Gin web framework. Middleware in Gin allows you to process a request before it reaches the main handler, which is useful for logging, authentication, and more.',
    tags: ['golang', 'gin', 'middleware', 'api'],
    language: 'Go',
    author: 'Maria Garcia',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'latina developer',
    starCount: 720,
    isStarred: false,
    isSaved: false,
    codeSnippet: `func LoggerMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        log.Printf(
            "| %d | %s | %s %s",
            c.Writer.Status(),
            time.Since(start),
            c.Request.Method,
            c.Request.RequestURI,
        )
    }
}`
  }
];

export default function ExplorePage() {
  const [communitySnippets, setCommunitySnippets] = useState<Snippet[]>(initialCommunitySnippets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const fetchUserInteractions = useCallback(async () => {
    if (!user) return;
    try {
      const snippetIds = initialCommunitySnippets.map(s => s.id);
      const { starred, saved } = await getUserInteractionStatus(user.uid, snippetIds);
      setCommunitySnippets(prev => 
          prev.map(snippet => ({
              ...snippet,
              isStarred: starred.has(snippet.id),
              isSaved: saved.has(snippet.id)
          }))
      );
    } catch (error) {
        console.error("Failed to fetch user interactions", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load your starred/saved snippets.' });
    }
  }, [user, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only fetch interactions after auth state is resolved and we have a user
    if (!authLoading && user) {
        fetchUserInteractions();
    }
     else if (!authLoading && !user) {
      // If auth is resolved and there's no user, reset to default state
      setCommunitySnippets(initialCommunitySnippets);
    }
  }, [user, authLoading, fetchUserInteractions]);


  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialCommunitySnippets.forEach(snippet => {
      snippet.tags.forEach(tag => tags.add(tag));
    });
    return ['All', ...Array.from(tags)];
  }, []);

  const handleTagClick = (tag: string) => {
    if (tag === 'All') {
        setActiveTag(null);
    } else {
        setActiveTag(tag);
        setSearchTerm('');
    }
  };

  const updateSnippetState = (id: string, updates: Partial<Snippet>) => {
    const updater = (prev: Snippet[]) => prev.map(s => s.id === id ? { ...s, ...updates } : s);
    setCommunitySnippets(updater);
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

  const filteredSnippets = useMemo(() => {
    let snippets = communitySnippets;

    if (activeTag) {
        snippets = snippets.filter(snippet => snippet.tags.includes(activeTag));
    }

    if (searchTerm) {
        snippets = snippets.filter(snippet => 
            snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (snippet.description && snippet.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (snippet.language && snippet.language.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (snippet.author && snippet.author.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    return snippets;
  }, [searchTerm, activeTag, communitySnippets]);
  
  if (isLoading) {
      return <ExploreLoading />;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="space-y-6">
        <div className="space-y-2 pt-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore Community Snippets</h1>
        </div>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search by title, tag, language, or author..." 
                className="pl-10 w-full md:w-2/3"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="sticky top-[-1px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-3 my-6 border-b">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3">
          {allTags.map(tag => (
              <Button 
                  key={tag} 
                  variant={activeTag === tag || (tag === 'All' && !activeTag) ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleTagClick(tag)}
                  className="shrink-0"
              >
                  {tag}
              </Button>
          ))}
          </div>
      </div>
          
        {filteredSnippets.length > 0 ? (
          <div className="pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSnippets.map(snippet => (
                  <SnippetCard 
                      key={snippet.id} 
                      snippet={snippet} 
                      onSelect={setSelectedSnippet}
                      onTagClick={handleTagClick}
                      onToggleStar={handleToggleStar}
                      onToggleSave={handleToggleSave}
                      collectionType="explore"
                  />
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold">No Snippets Found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filter.</p>
          </div>
        )}

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
    </div>
  );
}
