import { SubjectWithLessons } from 'kysely-codegen';
import React from 'react';
import LessonCreationForm from '@/app/lessons/(components)/lesson_creation_form';

import { AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Separator } from '../ui/separator';
import LessonCard from './lesson_card';

type SubjectItemProps = {
  subject: SubjectWithLessons;
};

const SubjectItem: React.FC<SubjectItemProps> = ({ subject }) => {
  const lessons = subject.lessons;
  const subjectLevel = subject.level;
  const subjectLanguage = subject.lang;

  return (
    <AccordionItem
      value={subject.id}
      className="px-3 border border-zinc-300 rounded-lg w-full hover:shadow-sm data-[state=open]:shadow-lg"
    >
      <AccordionTrigger className="hover:no-underline ">
        <div className="flex flex-col items-start ">
          <h2 className="text-sm text-zinc-600 uppercase">{subject.name}</h2>
          <div className="text-base text-zinc-800 font-medium">{subject.level}</div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-4 mb-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
        <Separator className="my-6" />
        <LessonCreationForm
          subjectId={subject.id}
          subjectLanguage={subjectLanguage}
          subjectLevel={subjectLevel}
        />
      </AccordionContent>
    </AccordionItem>
  );
};

export default SubjectItem;
