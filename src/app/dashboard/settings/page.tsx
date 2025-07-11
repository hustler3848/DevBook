import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Settings</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <Settings className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Application Settings</h2>
            <p className="text-muted-foreground mt-2">
                Manage your account and application preferences here.
            </p>
            <p className="text-sm text-muted-foreground mt-1">(Coming Soon)</p>
        </div>
    </div>
  );
}
