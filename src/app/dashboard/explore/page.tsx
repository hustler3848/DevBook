
"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Star, Eye, Plus } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

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
    stars: 1200,
    code: `export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
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
    stars: 876,
    code: `import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
});`
  },
  { 
    id: 3, 
    title: 'Tailwind CSS Plugin', 
    description: 'A simple plugin to add custom utilities for text shadows.', 
    tags: ['tailwindcss', 'css', 'plugin'], 
    language: 'JavaScript',
    author: 'Emily White',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman coder',
    stars: 2300,
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
    description: 'A simple dataclass for representing a user with roles.', 
    tags: ['python', 'dataclass'], 
    language: 'Python',
    author: 'Chen Wei',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'asian developer',
    stars: 950,
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
    description: 'A basic TCP echo server implemented using Tokio.',
    tags: ['rust', 'async', 'tokio', 'networking'],
    language: 'Rust',
    author: 'Alex Johnson',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'male programmer',
    stars: 1500,
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
    description: 'A custom logging middleware for the Gin web framework.',
    tags: ['golang', 'gin', 'middleware', 'api'],
    language: 'Go',
    author: 'Maria Garcia',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'latina developer',
    stars: 720,
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

type Snippet = typeof communitySnippets[0];

function CommunitySnippetCard({ snippet }: { snippet: Snippet }) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const syntaxTheme = theme === 'dark' ? oneDark : oneLight;
    const cardBg = theme === 'dark' ? 'bg-black/20' : 'bg-gray-50/50';

    const formatStars = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    if (!mounted) {
        return <Skeleton className="h-[450px] w-full" />
    }

    return (
        <Card className="glassmorphic flex flex-col h-full transition-all duration-300 ease-in-out hover:border-accent hover:shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-lg">{snippet.title}</CardTitle>
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
                    <Button variant="outline" className="w-full">
                        <Eye className="mr-2" /> View
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
                        <Plus className="mr-2" /> Save
                    </Button>
                 </div>
                 <div className="w-full space-y-3 pt-2 text-sm">
                    <p className="text-muted-foreground line-clamp-2">{snippet.description}</p>
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-muted-foreground">{formatStars(snippet.stars)} stars</span>
                    </div>
                     <div className="flex flex-wrap gap-2">
                        {snippet.tags.map(tag => (
                            <Badge key={tag} variant="secondary">
                            {tag}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={snippet.avatar} alt={snippet.author} data-ai-hint={snippet.dataAiHint} />
                            <AvatarFallback>{snippet.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-muted-foreground">{snippet.author}</span>
                    </div>
                 </div>
            </CardFooter>
        </Card>
    );
}


export default function ExplorePage() {
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
    <div className="animate-fade-in-up space-y-6">
        <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore Community Snippets</h1>
            <p className="text-muted-foreground">Discover snippets shared by developers from around the world.</p>
        </div>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search by title, tag, language, or author..." 
                className="pl-10 w-full md:w-1/2"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        
        {filteredSnippets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSnippets.map(snippet => (
                    <CommunitySnippetCard key={snippet.id} snippet={snippet} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">No Snippets Found</h2>
                <p className="text-muted-foreground mt-2">Try adjusting your search term.</p>
            </div>
        )}
    </div>
  );
}
