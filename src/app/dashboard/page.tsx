import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const snippets = [
  { id: 1, title: 'React Debounce Hook', description: 'A custom hook to debounce input.', tags: ['react', 'hooks', 'debounce', 'typescript'], language: 'TypeScript' },
  { id: 2, title: 'Python Web Scraper', description: 'Simple web scraper using BeautifulSoup.', tags: ['python', 'scraping', 'beautifulsoup'], language: 'Python' },
  { id: 3, title: 'Glassmorphism CSS', description: 'A CSS utility class for glassmorphism effect.', tags: ['css', 'ui', 'design'], language: 'CSS' },
  { id: 4, title: 'Node.js JWT Auth', description: 'Middleware for JWT authentication in Express.', tags: ['nodejs', 'jwt', 'express', 'auth'], language: 'JavaScript' },
  { id: 5, title: 'Async/Await Error Handling', description: 'A wrapper for cleaner async error handling.', tags: ['javascript', 'async', 'error-handling'], language: 'JavaScript' },
  { id: 6, title: 'Docker Compose for MERN', description: 'A docker-compose file for MERN stack.', tags: ['docker', 'mern', 'devops'], language: 'YAML' },
];

function SnippetCard({ snippet }: { snippet: typeof snippets[0] }) {
  const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    // Using fixed saturation and lightness for pastel-like colors
    return `hsl(${h}, 50%, 30%)`;
  };

  const getTagTextColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
     // Using fixed saturation and lightness for pastel-like colors
    return `hsl(${h}, 100%, 85%)`;
  }

  return (
    <Card className="glassmorphic flex flex-col h-full transition-colors duration-300">
      <CardHeader>
        <CardTitle className="font-headline">{snippet.title}</CardTitle>
        <CardDescription>{snippet.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {snippet.tags.map(tag => (
            <Badge 
              key={tag} 
              style={{ 
                backgroundColor: getTagColor(tag), 
                color: getTagTextColor(tag),
                borderColor: getTagColor(tag) 
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">{snippet.language}</p>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Your Snippets</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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