
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getUserSnippets, getSavedSnippets, getStarredSnippets } from "@/lib/firebase/firestore";
import type { Snippet } from "@/types/snippet";

import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import DashboardClientPage from "./dashboard-client-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, Eye, Star, Bookmark, FileText } from "lucide-react";

function DashboardLoading() {
  return (
    <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[98px] w-full" />
            ))}
        </div>
        <Skeleton className="h-[74px] w-full" />
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
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
    </div>
  )
}


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [starredSnippets, setStarredSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    };

    async function fetchUserActivity() {
      try {
        const [my, saved, starred] = await Promise.all([
          getUserSnippets(user!.uid),
          getSavedSnippets(user!.uid),
          getStarredSnippets(user!.uid)
        ]);
        setMySnippets(my);
        setSavedSnippets(saved);
        setStarredSnippets(starred);
      } catch (error) {
        console.error("Failed to fetch user activity", error);
        // Optionally show a toast message here
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserActivity();

  }, [user, authLoading]);

  const totalStars = mySnippets.reduce((sum, snippet) => sum + (snippet.starCount || 0), 0);
  const publicSnippets = mySnippets.filter(s => s.isPublic).length;

  if (isLoading) {
    return <DashboardLoading />;
  }
  
  return (
    <div className="animate-fade-in-up">
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Code} title="Total Snippets" value={mySnippets.length} />
                <StatCard icon={Eye} title="Public Snippets" value={publicSnippets} />
                <StatCard icon={Bookmark} title="Saved Snippets" value={savedSnippets.length} />
                <StatCard icon={Star} title="Total Stars" value={totalStars} />
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Snippets */}
            <DashboardClientPage snippets={mySnippets.slice(0, 4)} title="Your Snippets" collectionType="my-snippets"/>

             {/* Activity Feed Placeholder */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">Recent Activity</h2>
                <div className="rounded-lg border bg-card text-card-foreground p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Activity Feed Coming Soon</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Get updates on your snippets and community interactions here.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
