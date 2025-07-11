import DashboardClientPage from "./dashboard-client-page";

const snippets = [
  { id: 1, title: 'React Debounce Hook', description: 'A custom hook to debounce input.', tags: ['react', 'hooks', 'debounce', 'typescript'], language: 'TypeScript' },
  { id: 2, title: 'Python Web Scraper', description: 'Simple web scraper using BeautifulSoup.', tags: ['python', 'scraping', 'beautifulsoup'], language: 'Python' },
  { id: 3, title: 'Glassmorphism CSS', description: 'A CSS utility class for glassmorphism effect.', tags: ['css', 'ui', 'design'], language: 'CSS' },
  { id: 4, title: 'Node.js JWT Auth', description: 'Middleware for JWT authentication in Express.', tags: ['nodejs', 'jwt', 'express', 'auth'], language: 'JavaScript' },
  { id: 5, title: 'Async/Await Error Handling', description: 'A wrapper for cleaner async error handling.', tags: ['javascript', 'async', 'error-handling'], language: 'JavaScript' },
  { id: 6, title: 'Docker Compose for MERN', description: 'A docker-compose file for MERN stack.', tags: ['docker', 'mern', 'devops'], language: 'YAML' },
];

export default function DashboardPage() {
  return <DashboardClientPage snippets={snippets} />;
}
