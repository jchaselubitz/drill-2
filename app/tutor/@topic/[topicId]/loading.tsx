import { LessonListSkeleton } from '@/components/lessons/lesson_list';

export default function TutorLoading() {
  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="px-4 w-full">
          <LessonListSkeleton />
        </div>
      </div>
    </div>
  );
}
