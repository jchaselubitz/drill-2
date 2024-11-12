import React from 'react';
import { LanguagesISO639 } from '@/lib/lists';

import LessonOption, { OptionType } from './lesson_option';

interface LessonOptionListProps {
  options: OptionType[];
  userLanguage: LanguagesISO639;
  studyLanguage: LanguagesISO639;
  level: string;
  subjectId: string | undefined;
}

const LessonOptionList: React.FC<LessonOptionListProps> = ({
  options,
  userLanguage,
  studyLanguage,
  level,
  subjectId,
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
        />
      ))}
    </div>
  );
};

export default LessonOptionList;
