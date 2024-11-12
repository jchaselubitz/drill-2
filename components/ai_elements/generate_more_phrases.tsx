import React, { useState } from 'react';
import { addTranslationsToLesson } from '@/lib/actions/lessonActions';
import { getModelSelection, getOpenAiKey } from '@/lib/helpers/helpersAI';
import {
  phraseGenerationSystemInstructions,
  phraseResponseChecks,
  requestPhraseSuggestions,
} from '@/lib/helpers/promptGenerators';
import { LanguagesISO639 } from '@/lib/lists';
import { createClient } from '@/utils/supabase/client';

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
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const { prompt, format } = requestPhraseSuggestions({
      concept: lessonTitle,
      studyLanguage: studyLanguage,
      userLanguage: userLanguage,
      level: currentLevel ?? '',
      numberOfPhrases: 2,
    });

    const messages = [
      {
        role: 'system',
        content: phraseGenerationSystemInstructions({
          lang1: userLanguage,
          lang2: studyLanguage,
        }),
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const modelParams = {
      format,
    };
    try {
      const { data } = await supabase.functions.invoke('gen-text', {
        body: {
          userApiKey: getOpenAiKey(),
          modelSelection: getModelSelection(),
          modelParams: modelParams,
          messages: messages,
        },
      });

      const phaseArray = phraseResponseChecks({
        response: data,
        lang1: userLanguage,
        lang2: studyLanguage,
      });

      await addTranslationsToLesson({
        phrases: phaseArray,
        lessonId: lessonId,
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="w-full border-2 border-blue-600 rounded-lg text-blue-600 font-medium p-2"
      type="submit"
      onClick={handleGenerate}
    >
      {isLoading ? 'Loading...' : 'Generate More Cards'}
    </button>
  );
};

export default GenerateMorePhrases;
