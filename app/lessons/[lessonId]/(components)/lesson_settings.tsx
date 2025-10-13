'use client';

import { LessonWithTranslations, TranslationWithPhrase } from 'kysely-codegen';
import React, { useEffect, useState } from 'react';
import GenerateMorePhrases from '@/components/ai_elements/generate_more_phrases';
import GeneratePhraseAudio from '@/components/ai_elements/generate_phrase_audio';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { useUserContext } from '@/contexts/user_context';
import { getFileList } from '@/lib/helpers/helpersAudio';
import { hashString } from '@/lib/helpers/helpersDB';
import { downloadApkg, downloadCSV } from '@/lib/helpers/helpersExport';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

interface LessonSettingsProps {
  lesson: LessonWithTranslations;
  translationsWithoutAudio: (TranslationWithPhrase | undefined)[] | undefined;
}

const LessonSettings: React.FC<LessonSettingsProps> = ({
  lesson,
  translationsWithoutAudio: twa,
}) => {
  const supabase = createClient();
  const [buttonStateCSV, setButtonStateCSV] = useState<ButtonLoadingState>('default');
  const [buttonStateAPKG, setButtonStateAPKG] = useState<ButtonLoadingState>('default');
  const { userLanguage } = useUserContext();
  const [translationsWithoutAudio, setTranslationsWithoutAudio] = useState<
    (TranslationWithPhrase | undefined)[] | undefined
  >(twa);

  const translations = lesson.translations;
  const studyLanguage = lesson.sideTwo;

  const bucket = 'text-to-speech';

  useEffect(() => {
    const getTranslationsWithoutAudio = async () => {
      const fileList = (await getFileList({ supabase, bucket })).map((file) => file.name);
      const withoutAudio = await Promise.all(
        translations.map(async (translation) => {
          const text = translation?.phraseTarget.text as string;
          const fileName = ((await hashString(text as string)) + '.mp3') as string;
          if (!fileList.includes(fileName)) {
            return translation;
          }
        })
      );

      setTranslationsWithoutAudio(withoutAudio.filter(Boolean));
    };

    getTranslationsWithoutAudio();
  }, [supabase, translations, bucket]);

  const baseButtonClass = 'w-full rounded-lg text-white p-2';

  if (!userLanguage || !lesson.id) {
    return <div>Loading...</div>;
  }

  const examplesForLLM = translationsWithoutAudio?.slice(0, 2) ?? undefined;

  return (
    <div className="flex flex-col w-full">
      <hr className="border-gray-300 my-5" />
      <div className="flex flex-col md:flex-row w-full items-center justify-around gap-3">
        <div className="flex gap-2 w-full">
          <LoadingButton
            className={cn(baseButtonClass, ' bg-blue-600 text-white')}
            onClick={() => {
              downloadCSV({ lesson, setLoadingState: setButtonStateCSV });
            }}
            buttonState={buttonStateCSV}
            text="Download CSV"
            loadingText="Downloading..."
            successText="Downloaded"
            errorText="Error downloading"
          />

          <LoadingButton
            className={cn(baseButtonClass, ' bg-blue-600 text-white')}
            onClick={() => {
              downloadApkg({ lesson, setLoadingState: setButtonStateAPKG });
            }}
            buttonState={buttonStateAPKG}
            text="Download Anki Deck"
            loadingText="Downloading..."
            successText="Downloaded"
            errorText="Error downloading"
          />
        </div>
        {
          <GenerateMorePhrases
            hasPhrases={translations.length > 0}
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            studyLanguage={studyLanguage}
            userLanguage={userLanguage}
            currentLevel={lesson.level}
            examples={examplesForLLM}
          />
        }
        {translationsWithoutAudio && translationsWithoutAudio.length > 0 && (
          <GeneratePhraseAudio
            translations={translationsWithoutAudio}
            bucket={bucket}
            updateAudioStatuses={() => {
              const getTranslationsWithoutAudio = async () => {
                const fileList = (await getFileList({ supabase, bucket })).map((file) => file.name);
                const withoutAudio = await Promise.all(
                  translations.map(async (translation) => {
                    const text = translation?.phraseTarget.text as string;
                    const fileName = ((await hashString(text as string)) + '.mp3') as string;
                    if (!fileList.includes(fileName)) {
                      return translation;
                    }
                  })
                );

                setTranslationsWithoutAudio(withoutAudio.filter(Boolean));
              };

              getTranslationsWithoutAudio();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LessonSettings;
