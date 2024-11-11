import LessonCard from './lesson_card';
import LessonCreationForm from '@/app/lessons/(components)/lesson_creation_form';
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { SubjectWithLessons } from 'kysely-codegen';

type SubjectItemProps = {
  subject: SubjectWithLessons;
};

const SubjectItem: React.FC<SubjectItemProps> = ({ subject }) => {
  const lessons = subject.lessons;
  const subjectLevel = subject.level;
  const subjectLanguage = subject.lang;

  return (
    <AccordionItem value={subject.id} className="p-3 border rounded-lg w-full">
      <AccordionTrigger>
        <div>
          <h2>{subject.name}</h2>
          <p>{subject.level}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-4 mb-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
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
