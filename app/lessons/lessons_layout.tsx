'use client';

import { SubjectWithLessons } from 'kysely-codegen';
import { useMemo } from 'react';
import LessonList from '@/components/lessons/lesson_list';
import SubjectItemList from '@/components/lessons/subject_item_list';
import { useLessonsContext } from '@/contexts/lessons_context';

import ResponsiveLayout from '../responsive_layout';

interface LessonsLayoutProps {
  subjects: SubjectWithLessons[];
}

export default function LessonsLayout({ subjects }: LessonsLayoutProps) {
  const { selectedSubjectId } = useLessonsContext();

  const memoizedSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjects.find((s) => s.id === selectedSubjectId.toString()) ?? null;
  }, [selectedSubjectId, subjects]);

  const lessons = memoizedSubject?.lessons ?? [];

  return (
    <ResponsiveLayout
      detailPanelActive={!!selectedSubjectId}
      panel1={<SubjectItemList subjects={subjects} className={'mt-2'} />}
      panel2={
        <div className="px-4 w-full">
          <LessonList
            lessons={lessons}
            subjectId={memoizedSubject?.id}
            subjectLang={memoizedSubject?.lang}
            subjectLevel={memoizedSubject?.level}
          />
        </div>
      }
    />
  );
}
