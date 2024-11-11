'use client';

import React, { useState } from 'react';
import { BaseLesson } from 'kysely-codegen';
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
    <div className="md:flex justify-between">
      <button
        className="md:text-2xl font-bold hover:underline"
        onClick={() => toggleShowTitleEditor(true)}
      >
        {showTitleEditor ? (
          <input
            type="text"
            defaultValue={lesson.title}
            onBlur={(e) => {
              updateLessonTitle(e.target.value);
              toggleShowTitleEditor(false);
            }}
          />
        ) : (
          lesson.title
        )}
      </button>
      <div>
        {/* 
    <button className={cn(baseButtonClass, ' bg-blue-600 text-white')} onClick={toggleLessonSettings}>
     {showLessonSettings ? 'Hide Settings' : 'Show Settings'}
    </button>

    <button
     className={cn(
      baseButtonClass,
      lesson.show_side_2_first ? ' bg-blue-600 text-white ' : 'text-blue-600'
     )}
     onClick={updateSideOrder}
    >
     Show Back First
    </button> 
    */}
      </div>
    </div>
  );
};

export default LessonControlBar;
