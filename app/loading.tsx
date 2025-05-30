'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { useSelectedLayoutSegment } from 'next/navigation';

export default async function HomeLoading() {
  const segment = useSelectedLayoutSegment();
  if (segment === null) {
    return null;
  }
  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-4 md:items-center w-full ">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </main>
    </div>
  );
}
