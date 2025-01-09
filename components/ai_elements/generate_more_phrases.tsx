import { Iso639LanguageCode } from 'kysely-codegen';
import React, { useState } from 'react';
import { addPhrasesToLesson } from '@/lib/actions/lessonActions';
import { handleGeneratePhrases } from '@/lib/aiGenerators/generators_content';

interface GenerateMorePhrasesProps {
  lessonId: string;
  lessonTitle: string;
  studyLanguage: Iso639LanguageCode;
  userLanguage: Iso639LanguageCode;
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
    await addPhrasesToLesson({
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
