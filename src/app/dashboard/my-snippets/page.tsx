
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getUserSnippets } from "@/lib/firebase/firestore";
import type { Snippet } from "@/types/snippet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardClientPage from "../dashboard-client-page";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for saved and starred, will be replaced later
const savedSnippets = [
  { 
    id: 'community-3', 
    title: 'Tailwind CSS Plugin', 
    description: 'A simple plugin to add custom utilities for text shadows.', 
    tags: ['tailwindcss', 'css', 'plugin'], 
    language: 'JavaScript'
  },
  { 
    id: 'community-4', 
    title: 'Python Data Class', 
    description: 'A simple dataclass for representing a user with roles.', 
    tags: ['python', 'dataclass'], 
    language: 'Python'
  },
];

const starredSnippets = [
  { 
    id: 'community-1', 
    title: 'Custom Framer Motion Animation', 
    description: 'A reusable animation variant for stunning enter effects.', 
    tags: ['framer-motion', 'react', 'animation'], 
    language: 'TypeScript'
  },
  { 
    id: 'community-5', 
    title: 'Async Rust with Tokio', 
    description: 'A basic TCP echo server implemented using Tokio.', 
    tags: ['rust', 'async', 'tokio'], 
    language: 'Rust'
  },
   { id: 'community-2', title: 'Python Web Scraper', description: 'Simple web scraper using BeautifulSoup.', tags: ['python', 'scraping', 'beautifulsoup'], language: 'Python' },
];

function MySnippetsLoading() {
    return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
    )
}

export default function MySnippetsPage() {
  const { user } = useAuth();
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      const fetchSnippets = async () => {
        setIsLoading(true);
        const snippets = await getUserSnippets(user.uid);
        setMySnippets(snippets);
        setIsLoading(false);
      };
      fetchSnippets();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="animate-fade-in-up">
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
                {isLoading ? <MySnippetsLoading /> : <DashboardClientPage snippets={mySnippets} />}
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
