import React from 'react';
import TtsButton from '@/components/ai_elements/tts_button';
import { useLibraryContext } from '@/contexts/library_context';
import { getLangIcon, LanguagesISO639 } from '@/lib/lists';

interface TranslationRowProps {
  translationsPhrase: {
    id: string;
    text: string;
    lang: LanguagesISO639;
    lessonLink: string;
    lessonTitle: string;
  };
  navigateToPhrase?: (id: string) => void;
}

const TranslationRow: React.FC<TranslationRowProps> = ({
  translationsPhrase,
  navigateToPhrase,
}) => {
  const bucket = 'text_to_speech';
  const { setSelectedPhraseId } = useLibraryContext();

  const handlePhraseClick = () => {
    if (navigateToPhrase) {
      navigateToPhrase(translationsPhrase.id);
    } else {
      setSelectedPhraseId(translationsPhrase.id);
    }
  };

  return (
    <div
      key={translationsPhrase.id}
      className="justify-between border-b border-gray-200 p-2 w-full "
    >
      <div className="flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-2">
          <div>{getLangIcon(translationsPhrase.lang)}</div>

          <button className="flex items-center gap-1 text-left" onClick={handlePhraseClick}>
            {translationsPhrase.text}
          </button>
        </div>
        <div className="w-12">
          <TtsButton text={translationsPhrase.text} bucket={bucket} lacksAudio={false} />
        </div>
      </div>
    </div>
  );
};

export default TranslationRow;
