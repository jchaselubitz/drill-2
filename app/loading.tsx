import { Skeleton } from '@/components/ui/skeleton';

export default async function HomeLoading() {
  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-4 md:items-center w-full ">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </main>
    </div>
  );
}
