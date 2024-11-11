import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getModelSelection, getOpenAiKey } from '@/lib/helpers/helpersAI';
import { LanguagesISO639 } from '@/lib/lists';
import {
  phraseGenerationSystemInstructions,
  phraseResponseChecks,
  requestPhraseSuggestions,
} from '@/lib/helpers/promptGenerators';

interface GenerateMorePhrasesProps {
  userId?: string;
  lessonId: string;
  lessonTitle: string;
  studyLanguage: LanguagesISO639;
  userLanguage: LanguagesISO639;
  currentLevel: string | null;
}

const GenerateMorePhrases: React.FC<GenerateMorePhrasesProps> = ({
  userId,
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

      const cardsArray = phraseResponseChecks({
        response: data,
        lang1: userLanguage,
        lang2: studyLanguage,
      });

      const { error } = await supabase.rpc('add_translations_to_lesson', {
        _lesson_id: lessonId,
        _translations: cardsArray,
        _user_id: userId,
      });

      if (error) {
        throw Error(`${'Failed to insert cards:'} ${error.message}`);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('genText Error', error);
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
