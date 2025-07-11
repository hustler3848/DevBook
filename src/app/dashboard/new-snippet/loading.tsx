import { Skeleton } from "@/components/ui/skeleton";

export default function NewSnippetLoading() {
  return (
    <div className="container mx-auto max-w-4xl py-6 sm:py-8 animate-fade-in-up">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-2 mb-8">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
