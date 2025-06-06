'use client';

import { Iso639LanguageCode } from 'kysely-codegen';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { addSubjectLessonWithTranslations } from '@/lib/actions/lessonActions';
import { handleGeneratePhrases } from '@/lib/aiGenerators/generators_content';
import { getLangName } from '@/lib/lists';

import { OptionType } from './lesson_option';
import { useRouter } from 'next/navigation';

interface LessonOptionDetailsProps {
  option: OptionType;
  subjectId: string | undefined;
  studyLanguage: Iso639LanguageCode;
  userLanguage: Iso639LanguageCode;
  level: string;
  isSentences: boolean | undefined;
}

const LessonOptionDetails: React.FC<LessonOptionDetailsProps> = ({
  option,
  subjectId,
  studyLanguage,
  userLanguage,
  level,
  isSentences,
}) => {
  const [saveButtonState, setSaveButtonState] = useState<ButtonLoadingState>('default');
  const [regenButtonState, setRegenButtonState] = useState<ButtonLoadingState>('default');
  const router = useRouter();
  const [phraseArray, setPhraseArray] = useState(option.phrases ?? []);
  const [lessonLink, setLessonLink] = useState<string | null>(null);

  const fetchSuggestedPhrases = async () => {
    setRegenButtonState('loading');
    if (!studyLanguage || !userLanguage) {
      throw new Error('Language not selected');
    }
    const phraseArray = await handleGeneratePhrases({
      concept: option.title,
      studyLanguage,
      userLanguage,
      level: level,
      isSentences,
    });

    if (!phraseArray) {
      setRegenButtonState('error');
      return;
    } else {
      setPhraseArray(phraseArray);
      setRegenButtonState('success');
    }
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
        const lessonLink = `/lessons/${dbData.lessonId}`;
        setLessonLink(lessonLink);
        router.push(lessonLink);
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
