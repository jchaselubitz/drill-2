import React, { useState } from 'react';
import { addTranslationsToLesson } from '@/lib/actions/lessonActions';
import { handleGeneratePhrases } from '@/lib/helpers/helpersAI';
import { LanguagesISO639 } from '@/lib/lists';

interface GenerateMorePhrasesProps {
  lessonId: string;
  lessonTitle: string;
  studyLanguage: LanguagesISO639;
  userLanguage: LanguagesISO639;
  currentLevel: string | null;
}

const GenerateMorePhrases: React.FC<GenerateMorePhrasesProps> = ({
  lessonId,
  lessonTitle,
  studyLanguage,
  userLanguage,
  currentLevel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const phraseArray = await handleGeneratePhrases({
      concept: lessonTitle,
      studyLanguage,
      userLanguage,
      level: currentLevel,
    });
    if (!phraseArray) {
      setIsLoading(false);
      return;
    }
    await addTranslationsToLesson({
      phrases: phraseArray,
      lessonId: lessonId,
    });
    setIsLoading(false);
  };

  return (
    <button
      className="w-full border-2 border-blue-600 rounded-lg text-blue-600 font-medium p-2"
      type="submit"
      onClick={handleGenerate}
    >
      {isLoading ? 'Loading...' : 'Generate More'}
    </button>
  );
};

export default GenerateMorePhrases;
