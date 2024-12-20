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

  if (!note) {
    return (
      <Textarea
        placeholder="Add notes"
        value={currentNote}
        onChange={(e) => setCurrentNote(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        autoFocus
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)}>
      {isEditing ? (
        <Textarea
          placeholder="Add notes"
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          autoFocus
        />
      ) : (
        <div className="prose">
          <Markdown>{currentNote}</Markdown>
        </div>
      )}
    </div>
  );
};

export default PhraseNote;
