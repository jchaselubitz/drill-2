import Link from 'next/link';
import React from 'react';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
  };
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  return (
    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
      <div className="p-3 border rounded-lg">{lesson.title}</div>
    </Link>
  );
};

export default LessonCard;
