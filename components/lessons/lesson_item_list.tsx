'use client';

import { BaseLesson } from 'kysely-codegen';
import { XIcon } from 'lucide-react';
import React from 'react';
import LessonCreationForm from '@/app/lessons/(components)/lesson_creation_form';
import { useLessonsContext } from '@/app/lessons/lessons_context';
import { LanguagesISO639 } from '@/lib/lists';

import { Button } from '../ui/button';
import LessonCard from './lesson_card';

interface LessonItemListProps {
  lessons: BaseLesson[];
  subjectLang: string | undefined;
  subjectLevel: string | undefined | null;
  subjectId: string | undefined;
}

const LessonItemList: React.FC<LessonItemListProps> = ({
  lessons,
  subjectLang,
  subjectLevel,
  subjectId,
}) => {
  const { setSelectedSubjectId } = useLessonsContext();
  if (!lessons || lessons.length === 0 || !subjectId || !subjectLang || !subjectLevel)
    return (
      <div className="flex h-full items-center justify-center p-6 w-full">
        <div className="text-center">Select a subject to view lessons</div>
      </div>
    );

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-end items-center">
        <Button variant={'ghost'} size={'icon'} onClick={() => setSelectedSubjectId(null)}>
          <XIcon />{' '}
        </Button>
      </div>
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
      <LessonCreationForm
        subjectId={subjectId}
        subjectLanguage={subjectLang as LanguagesISO639}
        subjectLevel={subjectLevel}
      />
    </div>
  );
};

export default LessonItemList;
