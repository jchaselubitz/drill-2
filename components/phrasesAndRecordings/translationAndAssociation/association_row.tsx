import React from 'react';
import TtsButton from '@/components/ai_elements/tts_button';
import { getLangIcon, LanguagesISO639 } from '@/lib/lists';

interface AssociationRowProps {
  associatedPhrase: {
    id: string;
    text: string;
    lang: LanguagesISO639;
    lessonLink: string;
    lessonTitle: string;
  };

  setSelectedPhraseId: (id: string) => void;
}

const AssociationRow: React.FC<AssociationRowProps> = ({
  associatedPhrase,

  setSelectedPhraseId,
}) => {
  const bucket = 'text_to_speech';

  return (
    <div
      key={associatedPhrase.id}
      className="justify-between border border-gray-400 p-2 mb-2 w-full rounded-md"
    >
      <div className="flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-2 ">
          <div>{getLangIcon(associatedPhrase.lang)}</div>

          <button
            className="flex items-center text-left"
            onClick={() => setSelectedPhraseId(associatedPhrase.id)}
          >
            {associatedPhrase.text}
          </button>
        </div>
        <div className="w-12">
          <TtsButton text={associatedPhrase.text} bucket={bucket} lacksAudio={false} />
        </div>
      </div>
    </div>
  );
};

export default AssociationRow;
