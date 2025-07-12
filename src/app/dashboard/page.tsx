
import { DashboardHeader } from "@/components/dashboard-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import DashboardClientPage from "./dashboard-client-page";
import { Code, Eye, Star, Bookmark, FileText } from "lucide-react";

const snippets = [
  { id: 1, title: 'React Debounce Hook', description: 'A custom hook to debounce input.', tags: ['react', 'hooks', 'debounce', 'typescript'], language: 'TypeScript' },
  { id: 2, title: 'Python Web Scraper', description: 'Simple web scraper using BeautifulSoup.', tags: ['python', 'scraping', 'beautifulsoup'], language: 'Python' },
  { id: 3, title: 'Glassmorphism CSS', description: 'A CSS utility class for glassmorphism effect.', tags: ['css', 'ui', 'design'], language: 'CSS' },
  { id: 4, title: 'Node.js JWT Auth', description: 'Middleware for JWT authentication in Express.', tags: ['nodejs', 'jwt', 'express', 'auth'], language: 'JavaScript' },
];

// Mock data, in a real app this would be fetched
const userStats = {
    totalSnippets: 45,
    publicSnippets: 12,
    savedSnippets: 20,
    totalStars: 124,
};


export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 sm:py-8 animate-fade-in-up">
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Code} title="Total Snippets" value={userStats.totalSnippets} />
                <StatCard icon={Eye} title="Public Snippets" value={userStats.publicSnippets} />
                <StatCard icon={Bookmark} title="Saved Snippets" value={userStats.savedSnippets} />
                <StatCard icon={Star} title="Total Stars" value={userStats.totalStars} />
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Snippets */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">Your Snippets</h2>
                <DashboardClientPage snippets={snippets} />
            </div>

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
