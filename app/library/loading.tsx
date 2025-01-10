import { Skeleton } from '@/components/ui/skeleton';

import ResponsiveLayout from '../responsive_layout';
import { LibraryTableSkeleton } from './(components)/library_table';

export const TaskPanelSkeleton = () => {
  return (
    <div className="px-4 w-full">
      <div className="flex flex-col w-full h-full z-30 bg-white overflow-y-scroll">
        <div className=" flex flex-col p-4 border-b border-slate-200 gap-3  ">
          <div className="flex justify-between">
            <div className="flex justify-between w-full">
              <div className="flex gap-3 font-bold ">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                </div>
                <div>
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col w-full mb-3  text-xs font-medium">
              <div>
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col w-full mb-3  text-xs font-medium">
              <div>
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default async function LessonLoading() {
  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <div className="flex flex-col items-center gap-4 w-full">
        <ResponsiveLayout
          detailPanelActive={true}
          panel1={
            <div className=" w-full">
              <LibraryTableSkeleton />
            </div>
          }
          panel2={<TaskPanelSkeleton />}
        />
      </div>
    </div>
  );
}
