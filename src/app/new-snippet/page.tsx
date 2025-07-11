import { NewSnippetForm } from '@/components/new-snippet-form';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSnippetPage() {
    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
            </Link>
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold font-headline">Create New Snippet</h1>
                <p className="text-muted-foreground">Fill in the details below to add a new code snippet to your collection.</p>
            </div>
            <NewSnippetForm />
        </div>
    );
}
