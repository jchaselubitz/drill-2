import React, { useState } from 'react';

import LessonOptionDetails from './lesson_option_details';
import { BasePhrase } from 'kysely-codegen';
import { cn } from '@/lib/utils';
import { LanguagesISO639 } from '@/lib/lists';

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
  userLanguage: LanguagesISO639;
  studyLanguage: LanguagesISO639;
  level: string;
  subjectId: string | undefined;
}

const LessonOption: React.FC<LessonOptionProps> = ({
  option,
  userLanguage,
  studyLanguage,
  level,
  subjectId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
          <LessonOptionDetails
            option={option}
            subjectId={subjectId}
            studyLanguage={studyLanguage}
            userLanguage={userLanguage}
            level={level}
          />
        )}
      </div>
    </div>
  );
};

export default LessonOption;
