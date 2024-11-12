'use client';

import GenerateMorePhrases from '@/components/ai_elements/generate_more_phrases';
import GeneratePhraseAudio from '@/components/ai_elements/generate_phrase_audio';
import PhraseList from './phrase_list';
import React, { useEffect, useState } from 'react';
import { LessonWithTranslations, TranslationWithPhrase } from 'kysely-codegen';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { downloadApkg, downloadCSV } from '@/lib/helpers/helpersExport';
import { getFileList } from '@/lib/helpers/helpersAudio';
import { hashString } from '@/lib/helpers/helpersDB';
import { LanguagesISO639 } from '@/lib/lists';
import { useUserContext } from '@/contexts/user_context';

interface LessonSettingsProps {
  lesson: LessonWithTranslations;
}

const LessonSettings: React.FC<LessonSettingsProps> = ({ lesson }) => {
  const supabase = createClient();
  const { userLanguage } = useUserContext();
  const [translationsWithoutAudio, setTranslationsWithoutAudio] = useState<
    (TranslationWithPhrase | undefined)[] | undefined
  >([]);
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingAPKG, setLoadingAPKG] = useState(false);
  const translations = lesson.translations;
  const studyLanguage = lesson.translations[0]?.phraseSecondary.lang as LanguagesISO639;
  const bucket = 'text_to_speech';

  useEffect(() => {
    const getTranslationsWithoutAudio = async () => {
      const fileList = (await getFileList({ supabase, bucket })).map((file) => file.name);
      const withoutAudio = await Promise.all(
        translations.map(async (translation) => {
          const text = translation?.phraseSecondary.text as string;
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

  return (
    <div className="flex flex-col w-full">
      <hr className="border-gray-300 my-5" />
      <div className="flex flex-col md:flex-row w-full items-center justify-around gap-3">
        <div className="flex gap-2 w-full">
          <button
            className={cn(baseButtonClass, ' bg-blue-600 text-white')}
            onClick={() => {
              setLoadingCSV(true);
              downloadCSV(lesson, () => setLoadingCSV(false));
            }}
          >
            {loadingCSV ? 'Downloading' : 'Download CSV'}
          </button>
          <button
            className={cn(baseButtonClass, ' bg-blue-600 text-white')}
            onClick={() => {
              setLoadingAPKG(true);
              downloadApkg({ lesson, setLoadingFalse: () => setLoadingAPKG(false) });
            }}
          >
            {loadingAPKG ? 'Downloading' : 'Download APKG'}
          </button>
        </div>
        <GenerateMorePhrases
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          studyLanguage={studyLanguage}
          userLanguage={userLanguage}
          currentLevel={lesson.level}
        />
        {translationsWithoutAudio && translationsWithoutAudio.length > 0 && (
          <GeneratePhraseAudio
            translations={translationsWithoutAudio}
            bucket={bucket}
            updateAudioStatuses={() => {
              const getTranslationsWithoutAudio = async () => {
                const fileList = (await getFileList({ supabase, bucket })).map((file) => file.name);
                const withoutAudio = await Promise.all(
                  translations.map(async (translation) => {
                    const text = translation?.phraseSecondary.text as string;
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
      <hr className="border-gray-300 my-5" />
      <PhraseList
        translations={lesson.translations}
        bucket={bucket}
        translationsWithoutAudio={translationsWithoutAudio}
      />
    </div>
  );
};

export default LessonSettings;
