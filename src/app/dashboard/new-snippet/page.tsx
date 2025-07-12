import { NewSnippetForm } from '@/components/new-snippet-form';

export default function NewSnippetPage() {
    return (
        <div className="max-w-4xl animate-fade-in-up">
            <div className="space-y-2 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Snippet</h1>
                <p className="text-muted-foreground">Fill in the details below to add a new code snippet to your collection.</p>
            </div>
            <NewSnippetForm />
        </div>
    );
}
