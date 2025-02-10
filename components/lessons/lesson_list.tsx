'use client';

import { BaseLesson } from 'kysely-codegen';
import { Iso639LanguageCode } from 'kysely-codegen';
import { XIcon } from 'lucide-react';
import React from 'react';
import LessonGenerationForm, {
  LessonCreationForm,
} from '@/app/lessons/(components)/lesson_creation_form';
import { useLessonsContext } from '@/contexts/lessons_context';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import LessonCard from './lesson_card';

interface LessonListProps {
  lessons: BaseLesson[];
  subjectLang: Iso639LanguageCode | undefined | null | '';
  subjectLevel: string | undefined | null;
  subjectId: string | undefined;
}

const LessonList: React.FC<LessonListProps> = ({
  lessons,
  subjectLang,
  subjectLevel,
  subjectId,
}) => {
  const { setSelectedSubjectId } = useLessonsContext();
  if (!subjectId || !subjectLevel)
    return (
      <div className="flex h-full items-center justify-center p-6 w-full">
        <div className="text-center">Select a subject to view lessons</div>
      </div>
    );
  if (!subjectId) {
    return <LessonCreationForm subjectId={subjectId} level={subjectLevel as Iso639LanguageCode} />;
  }

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
      <div className="flex flex-wrap gap-2">
        <LessonGenerationForm
          subjectId={subjectId}
          subjectLanguage={subjectLang as Iso639LanguageCode}
          subjectLevel={subjectLevel}
        />
        <LessonCreationForm subjectId={subjectId} level={subjectLevel as Iso639LanguageCode} />
      </div>
    </div>
  );
};

export default LessonList;

export const LessonListSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-end items-center">
        <Button variant={'ghost'} size={'icon'}>
          <XIcon />{' '}
        </Button>
      </div>
      <Skeleton className="w-full h-20" />
      <Skeleton className="w-full h-20" />
    </div>
  );
};
