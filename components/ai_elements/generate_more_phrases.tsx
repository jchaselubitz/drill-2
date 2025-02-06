import { Iso639LanguageCode } from 'kysely-codegen';
import React, { useState } from 'react';
import { addPhrasesToLesson } from '@/lib/actions/lessonActions';
import { handleGeneratePhrases } from '@/lib/aiGenerators/generators_content';

import { LoadingButton } from '../ui/button-loading';

interface GenerateMorePhrasesProps {
  lessonId: string;
  lessonTitle: string;
  studyLanguage: Iso639LanguageCode;
  userLanguage: Iso639LanguageCode;
  currentLevel: string | null;
  hasPhrases: boolean;
}

const GenerateMorePhrases: React.FC<GenerateMorePhrasesProps> = ({
  lessonId,
  lessonTitle,
  studyLanguage,
  userLanguage,
  currentLevel,
  hasPhrases,
}) => {
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'error'>('default');

  const handleGenerate = async () => {
    setButtonState('loading');
    const phraseArray = await handleGeneratePhrases({
      concept: lessonTitle,
      studyLanguage,
      userLanguage,
      level: currentLevel,
    });
    if (!phraseArray) {
      setButtonState('error');
      return;
    }
    await addPhrasesToLesson({
      phrases: phraseArray,
      lessonId: lessonId,
    });
    setButtonState('default');
  };

  return (
    <LoadingButton
      variant={'outline'}
      size={'lg'}
      className="w-full  border-2 border-blue-600 rounded-lg text-blue-600 font-medium p-2"
      buttonState={buttonState}
      text={hasPhrases ? 'Generate more phrases' : 'Generate phrases from title'}
      loadingText="Generating..."
      errorText="Error generating phrases"
      onClick={handleGenerate}
    />
  );
};

export default GenerateMorePhrases;
