'use client';

import { BaseLesson } from 'kysely-codegen';
import React, { useState } from 'react';
import BackButton from '@/components/back_button';
import { Input } from '@/components/ui/input';
import { updateLessonTitle, deleteLesson, deleteLessonOnly } from '@/lib/actions/lessonActions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Trash2 } from 'lucide-react';

interface LessonControlBarProps {
  lesson: BaseLesson;
}

const LessonControlBar: React.FC<LessonControlBarProps> = ({ lesson }) => {
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

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
    <div className="flex gap-3 items-center justify-between">
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-2" disabled={deleting}>
            {deleting ? 'Deleting...' : <Trash2 className="w-4 h-4 text-red-500" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={async (e) => {
              e.preventDefault();
              if (
                confirm(
                  'Are you sure you want to delete this lesson? Associated translations and phrases will remain.'
                )
              ) {
                setDeleting(true);
                await deleteLessonOnly(lesson.id);
                setDeleting(false);
                router.push('/lessons');
              }
            }}
          >
            Delete lesson only
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async (e) => {
              e.preventDefault();
              if (
                confirm(
                  'Are you sure you want to delete this lesson and all associated phrases? This action cannot be undone.'
                )
              ) {
                setDeleting(true);
                await deleteLesson(lesson.id);
                setDeleting(false);
                router.push('/lessons');
              }
            }}
          >
            Delete lesson and phrases
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LessonControlBar;
