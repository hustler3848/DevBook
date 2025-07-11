import { Skeleton } from "@/components/ui/skeleton";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-6 sm:py-8 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="rounded-lg p-6 w-full">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="text-center space-y-1 w-full">
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-1/4 mx-auto" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
          </Skeleton>
          <Skeleton className="rounded-lg p-6 w-full">
             <Skeleton className="h-5 w-1/3 mb-4" />
             <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
             </div>
          </Skeleton>
        </div>
        <div className="lg:col-span-2">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-full rounded-xl" />
                    <div className="space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
}
