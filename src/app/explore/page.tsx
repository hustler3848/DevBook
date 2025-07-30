
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SnippetViewDialog } from '@/components/snippet-view-dialog';
import { useAuth } from '@/context/auth-context';
import { starSnippet, unstarSnippet, saveSnippet, unsaveSnippet, getUserInteractionStatus, getPublicSnippets } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Snippet } from '@/types/snippet';
import { SnippetCard } from '@/components/snippet-card';
import { Skeleton } from '@/components/ui/skeleton';


function ExplorePageLoading() {
  return (
    <div className="space-y-6 animate-fade-in-up pt-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
      </div>
      <Skeleton className="h-10 w-full md:w-2/3" />
      <div className="sticky top-[-1px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 my-6 border-b">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg bg-card h-[450px]">
             <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function ExplorePage() {
  const [communitySnippets, setCommunitySnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const fetchExploreSnippets = useCallback(async () => {
    setIsLoading(true);
    try {
        const publicSnippets = await getPublicSnippets(user?.uid);
        setCommunitySnippets(publicSnippets);
    } catch (error) {
        console.error("Failed to fetch public snippets", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load community snippets.' });
    } finally {
        setIsLoading(false);
    }
  }, [toast, user]);

  const fetchUserInteractions = useCallback(async () => {
    if (!user || communitySnippets.length === 0) return;
    try {
      const { starred, saved } = await getUserInteractionStatus(user.uid);
      
      setCommunitySnippets(prev => 
          prev.map(snippet => ({
              ...snippet,
              isStarred: starred.has(snippet.id),
              isSaved: saved.has(snippet.id)
          }))
      );
    } catch (error) {
        console.error("Failed to fetch user interactions", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load your starred/saved snippets status.' });
    }
  }, [user, communitySnippets.length, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchExploreSnippets();
    }
  }, [fetchExploreSnippets, authLoading]);

  useEffect(() => {
    if (!authLoading && user && communitySnippets.length > 0) {
        const needsUpdate = communitySnippets.some(s => s.isStarred === undefined || s.isSaved === undefined);
        if (needsUpdate) {
            fetchUserInteractions();
        }
    }
     else if (!authLoading && !user) {
      setCommunitySnippets(prev => prev.map(s => ({...s, isStarred: false, isSaved: false})));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, communitySnippets.length]);


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
            await starSnippet(user.uid, snippet.id);
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
            await saveSnippet(user.uid, snippet.id);
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
      return <ExplorePageLoading />;
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

      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-3 my-6 border-b">
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
