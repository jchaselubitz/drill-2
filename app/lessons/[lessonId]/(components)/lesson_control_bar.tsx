'use client';

import { BaseLesson } from 'kysely-codegen';
import React, { useState } from 'react';
import BackButton from '@/components/back_button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';

interface LessonControlBarProps {
  lesson: BaseLesson;
}

const LessonControlBar: React.FC<LessonControlBarProps> = ({ lesson }) => {
  const supabase = createClient();
  const [showTitleEditor, setShowTitleEditor] = useState(false);

  const toggleShowTitleEditor = (setting: boolean) => {
    setShowTitleEditor(setting);
  };

  const updateLessonTitle = async (newTitle: string) => {
    const { error } = await supabase
      .from('lessons')
      .update({ title: newTitle })
      .eq('id', lesson.id);
    if (error) {
      throw Error(`Failed to update lesson title: ${error.message}`);
    }
  };

  return (
    <div className="md:flex gap-3">
      <BackButton />
      {showTitleEditor ? (
        <Input
          type="text"
          className=""
          defaultValue={lesson.title}
          autoFocus
          onBlur={(e) => {
            updateLessonTitle(e.target.value);
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
