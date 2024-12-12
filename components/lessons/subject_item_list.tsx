'use client';

import { SubjectWithLessons } from 'kysely-codegen';
import React from 'react';
import LessonCreationForm from '@/app/lessons/(components)/lesson_creation_form';
import { cn } from '@/lib/utils';

import SubjectItem from './subject_item';

interface SubjectItemListProps {
  subjects: SubjectWithLessons[];
  className?: string;
}

const SubjectItemList: React.FC<SubjectItemListProps> = ({ subjects, className }) => {
  if (!subjects)
    return (
      <div className="flex h-full items-center justify-center p-6 w-full">
        <div className="text-center">
          <LessonCreationForm startOpen={true} />
        </div>
      </div>
    );

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {subjects.map((subject) => (
        <SubjectItem key={subject.id} subject={subject} />
      ))}
    </div>
  );
};

export default SubjectItemList;
