import { LessonListSkeleton } from '@/components/lessons/lesson_list';

export default async function LessonLoading() {
  <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
    <LessonListSkeleton />
  </div>;
}
