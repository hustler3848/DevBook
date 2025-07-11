
import DashboardClientPage from "../dashboard-client-page";

// In a real application, you would fetch community snippets saved by the current user.
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

export default function SavedSnippetsPage() {
  return (
    <div className="pt-6 sm:pt-8">
      <DashboardClientPage snippets={savedSnippets} />
    </div>
  );
}
