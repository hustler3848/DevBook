"use client";

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const communitySnippets = [
  { 
    id: 1, 
    title: 'Custom Framer Motion Animation', 
    description: 'A reusable animation variant for stunning enter effects.', 
    tags: ['framer-motion', 'react', 'animation'], 
    language: 'TypeScript',
    author: 'Elena Petrova',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman developer',
    code: `
export const fadeInUp = {
  initial: {
    y: 30,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};` 
  },
  { 
    id: 2, 
    title: 'Drizzle ORM Schema', 
    description: 'Example schema for a posts and users table using Drizzle.', 
    tags: ['drizzle', 'orm', 'database', 'typescript'], 
    language: 'TypeScript',
    author: 'John Smith',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'man developer',
    code: `
import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }),
  content: text('content'),
});` 
  },
  { 
    id: 3, 
    title: 'Tailwind CSS Plugin', 
    description: 'A simple plugin to add custom utilities.', 
    tags: ['tailwindcss', 'css', 'plugin'], 
    language: 'JavaScript',
    author: 'Emily White',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman coder',
    code: `
const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addUtilities }) {
  const newUtilities = {
    '.text-shadow': {
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    },
  }
  addUtilities(newUtilities, ['responsive', 'hover'])
})`
  },
  { 
    id: 4, 
    title: 'Python Data Class', 
    description: 'A simple dataclass for representing a user.', 
    tags: ['python', 'dataclass'], 
    language: 'Python',
    author: 'Chen Wei',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'asian developer',
    code: `
from dataclasses import dataclass, field
from typing import List

@dataclass
class User:
    id: int
    name: str
    email: str
    roles: List[str] = field(default_factory=list)

    def is_admin(self) -> bool:
        return 'admin' in self.roles
` 
  },
];

type Snippet = typeof communitySnippets[0];

function SnippetListItem({ snippet, isActive, onClick }: { snippet: Snippet; isActive: boolean; onClick: () => void }) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200",
        isActive ? "border-primary shadow-lg" : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h3 className="font-semibold font-headline truncate">{snippet.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{snippet.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={snippet.avatar} alt={snippet.author} data-ai-hint={snippet.dataAiHint} />
            <AvatarFallback>{snippet.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{snippet.author}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function SnippetDetail({ snippet }: { snippet: Snippet | null }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

  if (!snippet) {
    return (
      <Card className="glassmorphic h-full flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <p>Select a snippet to view</p>
        </div>
      </Card>
    );
  }

  if (!mounted) {
    return (
        <Card className="glassmorphic h-full p-6">
            <div className="space-y-4">
                <div className="h-8 w-3/4 bg-muted rounded-md animate-pulse" />
                <div className="h-5 w-1/2 bg-muted rounded-md animate-pulse" />
                <div className="h-64 w-full bg-muted rounded-md animate-pulse" />
            </div>
        </Card>
    );
  }

  return (
    <Card className="glassmorphic h-full">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold font-headline">{snippet.title}</h2>
        <p className="text-muted-foreground mt-1">{snippet.description}</p>
        <div className="flex items-center gap-2 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={snippet.avatar} alt={snippet.author} data-ai-hint={snippet.dataAiHint} />
              <AvatarFallback>{snippet.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{snippet.author}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {snippet.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="mt-4 rounded-lg overflow-hidden bg-background/50">
            <SyntaxHighlighter
                language={snippet.language.toLowerCase()}
                style={syntaxTheme}
                customStyle={{ margin: 0, background: 'transparent' }}
                className="custom-scrollbar"
                codeTagProps={{className: "font-code text-sm"}}
            >
                {snippet.code.trim()}
            </SyntaxHighlighter>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExplorePage() {
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(communitySnippets[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSnippets = useMemo(() => {
    return communitySnippets.filter(snippet => 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      snippet.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full animate-fade-in-up space-y-6">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search snippets by title, tag, language..." 
                className="pl-10 w-full md:w-1/2"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
            <div className="md:col-span-1">
                <div className="space-y-4 h-full max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
                    {filteredSnippets.map(snippet => (
                        <SnippetListItem 
                            key={snippet.id}
                            snippet={snippet}
                            isActive={selectedSnippet?.id === snippet.id}
                            onClick={() => setSelectedSnippet(snippet)}
                        />
                    ))}
                </div>
            </div>
            <div className="md:col-span-2">
                <SnippetDetail snippet={selectedSnippet} />
            </div>
        </div>
    </div>
  );
}
