'use client';

import { BaseLesson } from 'kysely-codegen';
import React, { useState } from 'react';
import BackButton from '@/components/back_button';
import { Input } from '@/components/ui/input';
import { updateLessonTitle } from '@/lib/actions/lessonActions';

interface LessonControlBarProps {
  lesson: BaseLesson;
}

const LessonControlBar: React.FC<LessonControlBarProps> = ({ lesson }) => {
  const [showTitleEditor, setShowTitleEditor] = useState(false);

  const toggleShowTitleEditor = (setting: boolean) => {
    setShowTitleEditor(setting);
  };

  const handleTitleUpdate = async (newTitle: string) => {
    await updateLessonTitle({
      lessonId: lesson.id,
      newTitle,
    });
  };

  return (
    <div className="flex gap-3">
      <div className="hidden md:flex">
        <BackButton />
      </div>
      {showTitleEditor ? (
        <Input
          type="text"
          className=""
          defaultValue={lesson.title}
          autoFocus
          onBlur={(e) => {
            handleTitleUpdate(e.target.value);
            toggleShowTitleEditor(false);
          }}
        />
      ) : (
        <button
          className="md:text-2xl font-bold hover:underline"
          onClick={() => toggleShowTitleEditor(true)}
        >
          {lesson.title}
        </button>
      )}
    </div>
  );
};

export default LessonControlBar;
