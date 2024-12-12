import { SubjectWithLessons } from 'kysely-codegen';
import React from 'react';
import { useLessonsContext } from '@/app/lessons/lessons_context';
import { cn } from '@/lib/utils';

type SubjectItemProps = {
  subject: SubjectWithLessons;
};

const SubjectItem: React.FC<SubjectItemProps> = ({ subject }) => {
  const { setSelectedSubjectId } = useLessonsContext();
  const numLessons = subject.lessons.length;
  return (
    <button
      className={cn(
        'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-zinc-50'
        // mail.selected === item.id && 'bg-muted'
      )}
      onClick={() => setSelectedSubjectId(subject.id)}
    >
      <h2 className="text-base font-bold">{subject.level}</h2>
      <h1 className="text-sm">{subject.name}</h1>
      <div>
        {numLessons} lesson{`${numLessons > 1 ? 's' : ''}`}
      </div>
    </button>
  );
};

export default SubjectItem;
