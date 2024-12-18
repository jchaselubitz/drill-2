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
      className="justify-between border border-gray-400 p-2 mb-2 w-full rounded-md"
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

      {/* <div className="text-xs flex justify-between gap-3 items-center">
        {translationsPhrase.lessonLink && (
          <a
            className={cn(
              'flex p-1 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg gap-1'
            )}
            href={translationsPhrase.lessonLink}
          >
            <Languages /> <span>{translationsPhrase.lessonTitle}</span>
          </a>
        )}
      </div> */}
    </div>
  );
};

export default TranslationRow;
