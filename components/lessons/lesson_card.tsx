'use client';

import { BaseLesson } from 'kysely-codegen';
import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useLessonsContext } from '@/contexts/lessons_context';

interface LessonCardProps {
  lesson: BaseLesson;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const { setSelectedSubjectId } = useLessonsContext();

  const [loadingState, setLoadingState] = React.useState(false);

  const handleClick = () => {
    setSelectedSubjectId(lesson.subjectId);
    setLoadingState(true);
  };

  return (
    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
      <button
        className="flex justify-between p-3 border border-zinc-300 rounded-lg w-full shadow-sm hover:bg-zinc-50 items-center"
        onClick={() => handleClick()}
      >
        <div className="text-left">
          <div className="">{lesson.title}</div>
          <div className="text-xs text-gray-500">{lesson.shortDescription}</div>
        </div>
        {loadingState && <Loader2Icon className="mr-2 h-6 w-6 animate-spin" />}
      </button>
    </Link>
  );
};

export default LessonCard;
