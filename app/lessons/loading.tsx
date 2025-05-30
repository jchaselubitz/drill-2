import { LessonListSkeleton } from '@/components/lessons/lesson_list';
import { SubjectItemListSkeleton } from '@/components/lessons/subject_item_list';

import ResponsiveLayout from '../responsive_layout';

export default async function LessonLoading() {
  return (
    <ResponsiveLayout
      detailPanelActive={true}
      panel1={
        <div className=" w-full">
          <SubjectItemListSkeleton />
        </div>
      }
      panel2={
        <div className="px-4 w-full">
          <LessonListSkeleton />
        </div>
      }
    />
  );
}
