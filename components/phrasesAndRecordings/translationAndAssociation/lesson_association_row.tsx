import { useRouter } from 'next/navigation';
import React from 'react';

interface LessonRowProps {
  lesson: {
    id: string;
    title: string;
  };
  navigateToPhrase?: (id: string) => void;
}

const LessonRow: React.FC<LessonRowProps> = ({ lesson: { id, title } }) => {
  const router = useRouter();

  const handleLessonClick = () => {
    if (id) {
      router.push(`/lessons/${id}`);
    }
  };

  return (
    <div key={id} className="justify-between border-b border-gray-200 p-2 w-full ">
      <div className="flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-2 ">
          <button className="flex items-center text-left" onClick={handleLessonClick}>
            {title}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonRow;
