
import DashboardClientPage from "../dashboard-client-page";

// In a real application, you would fetch snippets starred by the current user.
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

export default function StarredSnippetsPage() {
  return (
    <div className="pt-6 sm:pt-8">
      <DashboardClientPage snippets={starredSnippets} />
    </div>
  );
}
