import { SubjectItemListSkeleton } from '@/components/lessons/subject_item_list';

export default async function TutorLoading() {
  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className=" w-full">
          <SubjectItemListSkeleton />
        </div>
      </div>
    </div>
  );
}
