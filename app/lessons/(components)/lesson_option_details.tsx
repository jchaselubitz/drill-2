'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { addSubjectLessonWithTranslations } from '@/lib/actions/lessonActions';
import { getModelSelection, getOpenAiKey } from '@/lib/helpers/helpersAI';
import {
  phraseGenerationSystemInstructions,
  phraseResponseChecks,
  requestPhraseSuggestions,
} from '@/lib/helpers/promptGenerators';
import { getLangName, LanguagesISO639 } from '@/lib/lists';
import { createClient } from '@/utils/supabase/client';

import { OptionType } from './lesson_option';

interface LessonOptionDetailsProps {
  option: OptionType;
  subjectId: string | undefined;
  studyLanguage: LanguagesISO639;
  userLanguage: LanguagesISO639;
  level: string;
}

const LessonOptionDetails: React.FC<LessonOptionDetailsProps> = ({
  option,
  subjectId,
  studyLanguage,
  userLanguage,
  level,
}) => {
  const supabase = createClient();
  const [saveButtonState, setSaveButtonState] = useState<ButtonLoadingState>('default');
  const [regenButtonState, setRegenButtonState] = useState<ButtonLoadingState>('default');

  const [phraseArray, setPhraseArray] = useState(option.phrases ?? []);
  const [lessonLink, setLessonLink] = useState<string | null>(null);

  const fetchSuggestedPhrases = async () => {
    setRegenButtonState('loading');
    if (!studyLanguage || !userLanguage) {
      throw new Error('Language not selected');
    }

    const { prompt, format } = requestPhraseSuggestions({
      concept: option.title,
      studyLanguage,
      userLanguage,
      level: level,
      numberOfPhrases: 20,
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

    const { data, error } = await supabase.functions.invoke('gen-text', {
      body: {
        userApiKey: getOpenAiKey(),
        modelSelection: getModelSelection(),
        modelParams: modelParams,
        messages: messages,
      },
    });
    if (error) {
      setRegenButtonState('error');
      throw Error('Translation Save Error', error);
    }

    setPhraseArray(
      phraseResponseChecks({
        response: data,
        lang1: userLanguage,
        lang2: studyLanguage,
      })
    );
    setRegenButtonState('success');
  };

  const handleSave = async (option: OptionType) => {
    setSaveButtonState('loading');

    try {
      const dbData = await addSubjectLessonWithTranslations({
        title: option.title,
        description: option.description,
        level: level,
        phrases: phraseArray,
        subjectId: subjectId,
        subjectName: getLangName(studyLanguage),
      });

      if (dbData) {
        setLessonLink(`/lessons/${dbData.lessonId}`);

        setSaveButtonState('success');
      }
    } catch {
      setSaveButtonState('error');
      throw Error('Translation Save Error');
    }
  };

  return (
    <div className="p-1">
      <div className="flex px-4 pb-4 gap-2 w-full">
        {phraseArray.length > 0 && (
          <>
            {lessonLink ? (
              <Link href={lessonLink}>
                <Button variant={'default'}>Go to Lesson</Button>
              </Link>
            ) : (
              <LoadingButton
                variant={'default'}
                onClick={() => handleSave(option)}
                buttonState={saveButtonState}
                text="Save Translations"
                loadingText={'Saving ...'}
                successText={'Saved'}
                errorText={'Error'}
              />
            )}
          </>
        )}
        <LoadingButton
          variant={'default'}
          disabled={regenButtonState === 'loading'}
          buttonState={regenButtonState}
          text={phraseArray.length > 0 ? 'Regenerate Cards' : 'Generate Cards'}
          loadingText="Generating..."
          successText="Generated"
          errorText="Error"
          onClick={fetchSuggestedPhrases}
        />
      </div>

      {phraseArray &&
        phraseArray.map((card, index) => (
          <div
            key={index}
            className={`flex flex-col ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} p-2`}
          >
            <span className="flex leading-tight">
              <span className="font-bold whitespace-nowrap mr-1">{getLangName(userLanguage)}:</span>
              <span>{card.phrase_primary.text}</span>
            </span>
            <span className="flex leading-tight">
              <span className="font-bold whitespace-nowrap mr-1">
                {getLangName(studyLanguage)}:
              </span>
              <span>{card.phrase_secondary.text}</span>
            </span>
          </div>
        ))}
    </div>
  );
};

export default LessonOptionDetails;