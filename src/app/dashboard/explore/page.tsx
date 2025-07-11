
"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Star } from 'lucide-react';

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
  }
];

type Snippet = typeof communitySnippets[0];

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
        case 'rust':
            return { backgroundColor: '#dea584', color: '#000000' };
        case 'go':
            return { backgroundColor: '#00add8', color: '#ffffff' };
        default:
            return { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' };
    }
};

function CommunitySnippetCard({ snippet }: { snippet: Snippet }) {
    const langColors = getLanguageColors(snippet.language);
    
    const formatStars = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    return (
        <Card className="glassmorphic flex flex-col h-full transition-all duration-300 ease-in-out hover:border-accent hover:shadow-lg hover:scale-[1.02]">
            <CardHeader>
                <CardTitle className="font-headline text-lg mb-2">{snippet.title}</CardTitle>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={snippet.avatar} alt={snippet.author} data-ai-hint={snippet.dataAiHint} />
                            <AvatarFallback>{snippet.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-muted-foreground">{snippet.author}</span>
                    </div>
                    <Badge style={langColors} className="text-xs">{snippet.language}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <CardDescription className="text-sm line-clamp-2">{snippet.description}</CardDescription>
                <div className="flex flex-wrap gap-1">
                    {snippet.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                 <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{formatStars(snippet.stars)}</span>
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
