import { Compass } from 'lucide-react';

export default function ExplorePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Compass className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold font-headline">Explore Snippets</h1>
        <p className="text-muted-foreground mt-2">
            Discover amazing code snippets from the community.
        </p>
        <p className="text-sm text-muted-foreground mt-1">(Coming Soon)</p>
    </div>
  );
}
