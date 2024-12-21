import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { updatePhraseNote } from '@/lib/actions/phraseActions';

import { Textarea } from '../ui/textarea';

interface PhraseNoteProps {
  note: string | null;
  phraseId: string;
}

const PhraseNote: React.FC<PhraseNoteProps> = ({ note, phraseId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(note ?? '');

  const handleBlur = async () => {
    setIsEditing(false);
    await updatePhraseNote({ phraseId, note: currentNote });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleBlur();
    }
  };

  const notesForm = (
    <div className="flex flex-col gap-1">
      <Textarea
        placeholder="Add notes"
        className="rounded-sm"
        value={currentNote}
        onChange={(e) => setCurrentNote(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => handleKeyDown(e)}
        autoFocus
      />
      <div className="text-xs text-neutral-600">
        Press Enter to save. Use{' '}
        <a
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Markdown
        </a>{' '}
        for formatting
      </div>
    </div>
  );

  if (!note) {
    return notesForm;
  }

  return (
    <div onClick={() => setIsEditing(true)}>
      {isEditing ? (
        notesForm
      ) : (
        <div className="prose-sm p-2 text-sm rounded-md bg-neutral-50 border border-neutral-200">
          <Markdown>{currentNote}</Markdown>
        </div>
      )}
    </div>
  );
};

export default PhraseNote;
