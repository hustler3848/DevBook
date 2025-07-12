
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] animate-fade-in-up">
        <Settings className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold font-headline mt-4">Settings</h1>
        <p className="text-muted-foreground mt-2">Coming Soon!</p>
    </div>
  );
}
