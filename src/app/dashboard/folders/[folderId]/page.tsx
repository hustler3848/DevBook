
"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getFolder, getSnippetsInFolder, removeSnippetFromFolder } from '@/lib/firebase/firestore';
import type { Folder } from '@/types/folder';
import type { Snippet } from '@/types/snippet';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import DashboardClientPage from '../../dashboard-client-page';

function FolderLoading() {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
        </div>
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
    );
}

export default function FolderPage() {
    const { folderId } = useParams<{ folderId: string }>();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [folder, setFolder] = useState<Folder | null>(null);
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFolderData = useCallback(async () => {
        if (!user || !folderId) return;
        setIsLoading(true);
        try {
            const [folderData, snippetsData] = await Promise.all([
                getFolder(user.uid, folderId),
                getSnippetsInFolder(user.uid, folderId),
            ]);
            
            if (folderData) {
                setFolder(folderData);
                setSnippets(snippetsData);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Folder not found.' });
                router.push('/dashboard/my-snippets');
            }
        } catch (error) {
            console.error("Failed to fetch folder data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load the folder.' });
        } finally {
            setIsLoading(false);
        }
    }, [user, folderId, toast, router]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchFolderData();
        }
    }, [authLoading, user, fetchFolderData]);

    const handleRemoveFromFolder = (snippet: Snippet) => {
        if (!user || !folder) return;
        startTransition(async () => {
            try {
                await removeSnippetFromFolder(user.uid, folder.id, snippet.id);
                setSnippets(prev => prev.filter(s => s.id !== snippet.id));
                toast({ title: "Removed", description: `${snippet.title} removed from ${folder.name}.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: "Failed to remove snippet." });
            }
        });
    };

    if (isLoading || authLoading) {
        return <FolderLoading />;
    }

    if (!folder) {
        // This case is handled by the redirect in fetchFolderData, but it's good practice to have a fallback.
        return <div className="text-center py-10">Folder not found.</div>;
    }

    return (
        <div className="animate-fade-in-up space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <div>
                <h1 className="text-3xl font-bold font-headline">{folder.name}</h1>
                <p className="text-muted-foreground mt-1">{folder.description}</p>
            </div>
            
            <DashboardClientPage 
                snippets={snippets} 
                collectionType="saved"
                onToggleSave={handleRemoveFromFolder}
            />
            
            {snippets.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
                    <h2 className="text-xl font-semibold">This Folder is Empty</h2>
                    <p className="text-muted-foreground mt-2">Add snippets to this folder from the Explore page or your collection.</p>
                </div>
            )}
        </div>
    );
}

