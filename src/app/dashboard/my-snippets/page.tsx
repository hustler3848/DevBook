import DashboardClientPage from "../dashboard-client-page";

// In a real application, you would fetch snippets created by the current user.
const mySnippets = [
  { id: 1, title: 'React Debounce Hook', description: 'A custom hook to debounce input.', tags: ['react', 'hooks', 'debounce', 'typescript'], language: 'TypeScript' },
  { id: 4, title: 'Node.js JWT Auth', description: 'Middleware for JWT authentication in Express.', tags: ['nodejs', 'jwt', 'express', 'auth'], language: 'JavaScript' },
  { id: 5, title: 'Async/Await Error Handling', description: 'A wrapper for cleaner async error handling.', tags: ['javascript', 'async', 'error-handling'], language: 'JavaScript' },
];

export default function MySnippetsPage() {
  return <DashboardClientPage snippets={mySnippets} />;
}
