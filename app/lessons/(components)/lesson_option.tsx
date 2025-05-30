import { BasePhrase, Iso639LanguageCode } from 'kysely-codegen';
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import LessonOptionDetails from './lesson_option_details';

export interface PhraseType {
  phrase_primary: BasePhrase;
  phrase_secondary: BasePhrase;
}
export interface OptionType {
  title: string;
  description: string;
  phrases?: PhraseType[];
}

interface LessonOptionProps {
  option: OptionType;
  userLanguage: Iso639LanguageCode;
  studyLanguage: Iso639LanguageCode;
  level: string;
  subjectId: string | undefined;
  isSentences: boolean | undefined;
  startOpen: boolean;
}

const LessonOption: React.FC<LessonOptionProps> = ({
  option,
  userLanguage,
  studyLanguage,
  level,
  subjectId,
  isSentences,
  startOpen,
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  const handleSelected = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ') {
      handleSelected();
    }
  };

  return (
    <div
      className={cn(
        'flex rounded-lg w-full items-center justify-start',
        'hover:bg-gray-200 hover:shadow-sm focus:bg-slate-300 transition-colors duration-200 ease-in-out',
        'bg-gray-100'
      )}
    >
      <div className="flex flex-col gap-3 w-full pb-4">
        <button
          type="button"
          className="flex px-4 pt-4 w-full items-start"
          tabIndex={0}
          onClick={handleSelected}
          onKeyDown={(e) => handleKeyDown(e)}
        >
          <div className="col-span-11 flex flex-col items-start">
            <div className="text-gray-700 text-sm font-bold mb-2 text-left">{option.title}</div>
            <div className="text-gray-700 text-sm text-left">{option.description}</div>
          </div>
        </button>

        {isOpen && (
          <>
            <Separator className="bg-zinc-300" />
            <LessonOptionDetails
              option={option}
              subjectId={subjectId}
              studyLanguage={studyLanguage}
              userLanguage={userLanguage}
              level={level}
              isSentences={isSentences}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LessonOption;
