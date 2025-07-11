
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardClientPage from "../dashboard-client-page";

const mySnippets = [
  { id: 1, title: 'React Debounce Hook', description: 'A custom hook to debounce input.', tags: ['react', 'hooks', 'debounce', 'typescript'], language: 'TypeScript' },
  { id: 4, title: 'Node.js JWT Auth', description: 'Middleware for JWT authentication in Express.', tags: ['nodejs', 'jwt', 'express', 'auth'], language: 'JavaScript' },
  { id: 5, title: 'Async/Await Error Handling', description: 'A wrapper for cleaner async error handling.', tags: ['javascript', 'async', 'error-handling'], language: 'JavaScript' },
];

const savedSnippets = [
  { 
    id: 3, 
    title: 'Tailwind CSS Plugin', 
    description: 'A simple plugin to add custom utilities for text shadows.', 
    tags: ['tailwindcss', 'css', 'plugin'], 
    language: 'JavaScript'
  },
  { 
    id: 4, 
    title: 'Python Data Class', 
    description: 'A simple dataclass for representing a user with roles.', 
    tags: ['python', 'dataclass'], 
    language: 'Python'
  },
];

const starredSnippets = [
  { 
    id: 1, 
    title: 'Custom Framer Motion Animation', 
    description: 'A reusable animation variant for stunning enter effects.', 
    tags: ['framer-motion', 'react', 'animation'], 
    language: 'TypeScript'
  },
  { 
    id: 5, 
    title: 'Async Rust with Tokio', 
    description: 'A basic TCP echo server implemented using Tokio.', 
    tags: ['rust', 'async', 'tokio'], 
    language: 'Rust'
  },
   { id: 2, title: 'Python Web Scraper', description: 'Simple web scraper using BeautifulSoup.', tags: ['python', 'scraping', 'beautifulsoup'], language: 'Python' },
];


export default function MySnippetsPage() {
  return (
    <div className="pt-6 sm:pt-8 animate-fade-in-up">
        <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">My Collection</h1>
        </div>
        <Tabs defaultValue="my-snippets">
            <TabsList className="grid w-full grid-cols-3 md:w-fit">
                <TabsTrigger value="my-snippets">My Snippets</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
            </TabsList>
            <TabsContent value="my-snippets" className="pt-6">
                <DashboardClientPage snippets={mySnippets} />
            </TabsContent>
            <TabsContent value="saved" className="pt-6">
                <DashboardClientPage snippets={savedSnippets} />
            </TabsContent>
            <TabsContent value="starred" className="pt-6">
                <DashboardClientPage snippets={starredSnippets} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
