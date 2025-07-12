
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Upload } from 'lucide-react';

export function QuickActions() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 transition-opacity">
                       <Link href="/dashboard/new-snippet">
                         <Plus className="mr-2 h-5 w-5" /> Create Snippet
                       </Link>
                    </Button>
                     <Button variant="outline" size="lg">
                        <Upload className="mr-2 h-5 w-5" /> Import Snippet
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
