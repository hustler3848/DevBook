

"use client";

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Star, Eye, Plus, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SnippetViewDialog } from '@/components/snippet-view-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const initialCommunitySnippets = [
  { 
    id: 1, 
    title: 'Custom Framer Motion Animation', 
    description: 'A reusable animation variant for stunning enter effects. This is a very common pattern when working with Framer Motion and can be easily extended to include more complex animations and transitions.', 
    tags: ['framer-motion', 'react', 'animation', 'variants', 'ui'], 
    language: 'TypeScript',
    author: 'Elena Petrova',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman developer',
    stars: 1200,
    isStarred: false,
    isSaved: false,
    code: `export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};`
  },
  { 
    id: 2, 
    title: 'Drizzle ORM Schema', 
    description: 'Example schema for a posts and users table using Drizzle. Drizzle ORM provides a type-safe SQL-like experience for TypeScript projects, making database interactions safer and more predictable.', 
    tags: ['drizzle', 'orm', 'database', 'typescript'], 
    language: 'TypeScript',
    author: 'John Smith',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'man developer',
    stars: 876,
    isStarred: false,
    isSaved: false,
    code: `import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
});`
  },
  { 
    id: 3, 
    title: 'Tailwind CSS Plugin', 
    description: 'A simple plugin to add custom utilities for text shadows. Tailwind plugins are a powerful way to extend the framework with your own styles and logic.', 
    tags: ['tailwindcss', 'css', 'plugin'], 
    language: 'JavaScript',
    author: 'Emily White',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman coder',
    stars: 2300,
    isStarred: true,
    isSaved: false,
    code: `const plugin = require('tailwindcss/plugin')

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
    id: 4, 
    title: 'Python Data Class', 
    description: 'A simple dataclass for representing a user with roles. Dataclasses are a feature in Python that automatically generates special methods like __init__(), __repr__(), and more.', 
    tags: ['python', 'dataclass'], 
    language: 'Python',
    author: 'Chen Wei',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'asian developer',
    stars: 950,
    isStarred: false,
    isSaved: true,
    code: `from dataclasses import dataclass, field
from typing import List

@dataclass
class User:
    username: str
    roles: List[str] = field(default_factory=list)`
  },
  {
    id: 5,
    title: 'Async Rust with Tokio',
    description: 'A basic TCP echo server implemented using Tokio, the asynchronous runtime for Rust. This example demonstrates how to bind a listener and accept incoming connections.',
    tags: ['rust', 'async', 'tokio', 'networking'],
    language: 'Rust',
    author: 'Alex Johnson',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'male programmer',
    stars: 1500,
    isStarred: true,
    isSaved: true,
    code: `use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    let (mut socket, _) = listener.accept().await?;
    // ...
}`
  },
  {
    id: 6,
    title: 'Go Gin Middleware',
    description: 'A custom logging middleware for the Gin web framework. Middleware in Gin allows you to process a request before it reaches the main handler, which is useful for logging, authentication, and more.',
    tags: ['golang', 'gin', 'middleware', 'api'],
    language: 'Go',
    author: 'Maria Garcia',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'latina developer',
    stars: 720,
    isStarred: false,
    isSaved: false,
    code: `func LoggerMiddleware() gin.HandlerFunc {
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

export type Snippet = typeof initialCommunitySnippets[0];

function CommunitySnippetCard({ 
    snippet, 
    onSelect, 
    onTagClick,
    onToggleStar,
    onToggleSave,
}: { 
    snippet: Snippet, 
    onSelect: (snippet: Snippet) => void, 
    onTagClick: (tag: string) => void,
    onToggleStar: (id: number) => void,
    onToggleSave: (id: number) => void,
}) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const syntaxTheme = theme === 'dark' ? oneDark : oneLight;
    const cardBg = theme === 'dark' ? 'bg-black/10' : 'bg-gray-50/50';

    const formatStars = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    if (!mounted) {
        return <Skeleton className="h-[450px] w-full" />
    }

    const displayedTags = showAllTags ? snippet.tags : snippet.tags.slice(0, 2);

    return (
        <Card className="glassmorphic flex flex-col h-full transition-all duration-300 ease-in-out hover:border-accent hover:shadow-lg sm:max-w-none hover:-translate-y-1">
            <CardHeader>
                <CardTitle className="font-headline text-lg">{snippet.title}</CardTitle>
                <div className="flex pt-2">
                     <div className={cn(badgeVariants({ variant: "secondary" }))}>
                        {snippet.language}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className={cn("rounded-lg overflow-hidden text-sm", cardBg)}>
                   <SyntaxHighlighter
                     language={snippet.language.toLowerCase()}
                     style={syntaxTheme}
                     customStyle={{ margin: 0, padding: '1rem', background: 'transparent', height: '120px' }}
                     className="custom-scrollbar"
                     codeTagProps={{className: "font-code"}}
                   >
                     {snippet.code}
                   </SyntaxHighlighter>
                 </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                <div className="flex w-full items-center gap-2">
                    <Button variant="outline" className="w-full" onClick={() => onSelect(snippet)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
                        <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                </div>

                 <div className="w-full space-y-3 pt-2 text-sm">
                    <p className="text-muted-foreground line-clamp-2">{snippet.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        {displayedTags.map(tag => (
                             <button key={tag} onClick={() => onTagClick(tag)} className="rounded-full">
                                <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                                    {tag}
                                </Badge>
                             </button>
                        ))}
                        {snippet.tags.length > 2 && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAllTags(!showAllTags)}>
                                {showAllTags ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                <span className="sr-only">{showAllTags ? 'Show less tags' : 'Show more tags'}</span>
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-between items-center w-full pt-1">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={snippet.avatar} alt={snippet.author} data-ai-hint={snippet.dataAiHint} />
                                <AvatarFallback>{snippet.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-muted-foreground">{snippet.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="flex items-center gap-1" onClick={() => onToggleStar(snippet.id)}>
                                            <Star className={cn("h-4 w-4 transition-colors", snippet.isStarred ? "text-yellow-400 fill-yellow-400" : "hover:text-yellow-400")} />
                                            <span className="text-xs">{formatStars(snippet.stars + (snippet.isStarred ? 1 : 0))}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{snippet.isStarred ? 'Unstar' : 'Star'} Snippet</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="flex items-center gap-1" onClick={() => onToggleSave(snippet.id)}>
                                            <Bookmark className={cn("h-4 w-4 transition-colors", snippet.isSaved ? "text-primary fill-primary" : "hover:text-primary")} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{snippet.isSaved ? 'Unsave' : 'Save'} Snippet</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                 </div>
            </CardFooter>
        </Card>
    );
}


export default function ExplorePage() {
  const [communitySnippets, setCommunitySnippets] = useState(initialCommunitySnippets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    communitySnippets.forEach(snippet => {
      snippet.tags.forEach(tag => tags.add(tag));
    });
    return ['All', ...Array.from(tags)];
  }, [communitySnippets]);

  const handleTagClick = (tag: string) => {
    if (tag === 'All') {
        setActiveTag(null);
    } else {
        setActiveTag(tag);
        setSearchTerm('');
    }
  };

  const handleToggleStar = (id: number) => {
    setCommunitySnippets(prevSnippets =>
        prevSnippets.map(s =>
            s.id === id ? { ...s, isStarred: !s.isStarred } : s
        )
    );
    if (selectedSnippet && selectedSnippet.id === id) {
        setSelectedSnippet(prev => prev ? {...prev, isStarred: !prev.isStarred} : null);
    }
  };

  const handleToggleSave = (id: number) => {
      setCommunitySnippets(prevSnippets =>
          prevSnippets.map(s =>
              s.id === id ? { ...s, isSaved: !s.isSaved } : s
          )
      );
      if (selectedSnippet && selectedSnippet.id === id) {
        setSelectedSnippet(prev => prev ? {...prev, isSaved: !prev.isSaved} : null);
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
            snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            snippet.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
            snippet.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return snippets;
  }, [searchTerm, activeTag, communitySnippets]);

  return (
    <>
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
        <div className="pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map(snippet => (
                <CommunitySnippetCard 
                    key={snippet.id} 
                    snippet={snippet} 
                    onSelect={setSelectedSnippet}
                    onTagClick={handleTagClick}
                    onToggleStar={handleToggleStar}
                    onToggleSave={handleToggleSave} 
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
        onToggleStar={handleToggleStar}
        onToggleSave={handleToggleSave}
      />
    )}
    </>
  );
}
