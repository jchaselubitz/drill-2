'use client';

import { SubjectWithLessons } from 'kysely-codegen';
import { useMemo } from 'react';
import LessonItemList from '@/components/lessons/lesson_item_list';
import SubjectItemList from '@/components/lessons/subject_item_list';

import ResponsiveLayout from '../responsive_layout';
import { useLessonsContext } from './lessons_context';

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
          <LessonItemList
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
