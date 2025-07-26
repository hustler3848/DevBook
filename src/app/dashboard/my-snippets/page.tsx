
"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { getUserSnippets, getSavedSnippets, getStarredSnippets, unsaveSnippet, unstarSnippet, deleteSnippet, removeSnippetFromFolder } from "@/lib/firebase/firestore";
import type { Snippet } from "@/types/snippet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardClientPage from "../dashboard-client-page";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [starredSnippets, setStarredSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-snippets");
  const [isPending, startTransition] = useTransition();

  const fetchSnippets = useCallback(async (type: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      let snippets: Snippet[] = [];
      if (type === "my-snippets") {
        snippets = await getUserSnippets(user.uid);
        setMySnippets(snippets);
      } else if (type === "saved") {
        snippets = await getSavedSnippets(user.uid);
        setSavedSnippets(snippets);
      } else if (type === "starred") {
        snippets = await getStarredSnippets(user.uid);
        setStarredSnippets(snippets);
      }
    } catch (error) {
      console.error("Failed to fetch snippets:", error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Could not fetch your snippets. Please try again later.",
      })
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchSnippets(activeTab);
      } else {
        setIsLoading(false);
      }
    }
  }, [user, authLoading, activeTab, fetchSnippets]);

  const handleUnsave = (snippetId: string) => {
    if(!user) return;
    startTransition(async () => {
        try {
            await unsaveSnippet(user.uid, snippetId);
            setSavedSnippets(prev => prev.filter(s => s.id !== snippetId));
            toast({ title: "Unsaved", description: "Snippet removed from your saved list." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to unsave snippet." });
        }
    });
  };

  const handleUnstar = (snippetId: string) => {
    if(!user) return;
     startTransition(async () => {
        try {
            await unstarSnippet(user.uid, snippetId);
            setStarredSnippets(prev => prev.filter(s => s.id !== snippetId));
            toast({ title: "Unstarred", description: "Snippet removed from your starred list." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to unstar snippet." });
        }
    });
  };
  
  const handleDelete = (snippetId: string) => {
    if(!user) return;
    startTransition(async () => {
        try {
            await deleteSnippet(snippetId);
            setMySnippets(prev => prev.filter(s => s.id !== snippetId));
            toast({ title: "Deleted", description: "Snippet has been deleted." });
        } catch (error) {
            console.error("Failed to delete snippet:", error);
            toast({ variant: 'destructive', title: "Error", description: "Failed to delete snippet." });
        }
    });
  }

  return (
    <div className="animate-fade-in-up">
        <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">My Collection</h1>
        </div>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:w-fit">
                <TabsTrigger value="my-snippets">My Snippets</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
            </TabsList>
            <TabsContent value="my-snippets" className="pt-6">
                {isLoading ? <MySnippetsLoading /> : <DashboardClientPage snippets={mySnippets} collectionType="my-snippets" onDelete={handleDelete} />}
            </TabsContent>
            <TabsContent value="saved" className="pt-6">
                {isLoading ? <MySnippetsLoading /> : <DashboardClientPage snippets={savedSnippets} collectionType="saved" onUnsave={handleUnsave} />}
            </TabsContent>
            <TabsContent value="starred" className="pt-6">
                {isLoading ? <MySnippetsLoading /> : <DashboardClientPage snippets={starredSnippets} collectionType="starred" onUnstar={handleUnstar} />}
            </TabsContent>
        </Tabs>
    </div>
  );
}
