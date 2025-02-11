import { Iso639LanguageCode } from 'kysely-codegen';
import React from 'react';

import LessonOption, { OptionType } from './lesson_option';

interface LessonOptionListProps {
  options: OptionType[];
  userLanguage: Iso639LanguageCode;
  studyLanguage: Iso639LanguageCode;
  level: string;
  subjectId: string | undefined;
  isSentences: boolean | undefined;
}

const LessonOptionList: React.FC<LessonOptionListProps> = ({
  options,
  userLanguage,
  studyLanguage,
  level,
  subjectId,
  isSentences,
}) => {
  return (
    <div className="flex flex-col gap-4 prose">
      {options.map((option, i) => (
        <LessonOption
          key={i}
          option={option}
          studyLanguage={studyLanguage}
          userLanguage={userLanguage}
          level={level}
          subjectId={subjectId}
          isSentences={isSentences}
        />
      ))}
    </div>
  );
};

export default LessonOptionList;
