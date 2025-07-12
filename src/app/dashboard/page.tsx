
import { DashboardHeader } from "@/components/dashboard-header";
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card";
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
const userProfile = {
    name: 'Alex Johnson',
    username: 'currentuser',
    avatar: 'https://placehold.co/128x128.png',
    dataAiHint: 'user avatar',
    bio: 'Full-stack developer with a passion for building scalable and maintainable applications. Currently exploring the world of Go and Rust.',
    social: {
        github: 'https://github.com/alexjohnson',
        twitter: 'https://twitter.com/alexjohnson',
        linkedin: 'https://linkedin.com/in/alexjohnson',
    },
};

const userStats = {
    totalSnippets: 45,
    publicSnippets: 12,
    savedSnippets: 20,
    totalStars: 124,
};


export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 sm:py-8 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-4 xl:col-span-3">
                <div className="sticky top-20 space-y-6">
                   <ProfileSummaryCard user={userProfile} />
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-8">
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
    </div>
  );
}
