import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="rounded-lg p-6 w-full h-[280px]">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="text-center space-y-2 w-full pt-2">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
              <Skeleton className="h-10 w-full mt-2" />
              <div className="flex space-x-4 pt-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          </Skeleton>
          <Skeleton className="rounded-lg p-6 w-full h-[180px]">
             <Skeleton className="h-5 w-1/3 mb-4" />
             <div className="space-y-4 pt-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-full" />
             </div>
          </Skeleton>
        </div>
        <div className="lg:col-span-2">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg bg-card h-[250px]">
                   <Skeleton className="h-5 w-3/4" />
                   <Skeleton className="h-4 w-1/4" />
                   <Skeleton className="h-24 w-full" />
                   <Skeleton className="h-5 w-full" />
                   <div className="flex justify-between items-center pt-2">
                       <Skeleton className="h-6 w-1/4" />
                       <Skeleton className="h-5 w-1/5" />
                   </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
}
