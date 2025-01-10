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
    <div className={cn('flex flex-col w-full gap-3', className)}>
      {subjects.map((subject) => (
        <SubjectItem key={subject.id} subject={subject} />
      ))}
      <LessonCreationForm />
    </div>
  );
};

export default SubjectItemList;

export const SubjectItemListSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 w-full mt-2 ">
      <div className="w-full h-20 bg-gray-200 rounded-md animate-pulse" />
      <div className="w-full h-20 bg-gray-200 rounded-md animate-pulse" />
      <div className="w-full h-20 bg-gray-200 rounded-md animate-pulse" />
    </div>
  );
};
