import { TranslationWithPhrase } from 'kysely-codegen';
import React, { useState } from 'react';
import { getAudioFile } from '@/lib/helpers/helpersAudio';
import { hashString } from '@/lib/helpers/helpersDB';
import { createClient } from '@/utils/supabase/client';

import { LoadingButton } from '../ui/button-loading';

interface GeneratePhraseAudioProps {
  translations: (TranslationWithPhrase | undefined)[];
  bucket: string;
  updateAudioStatuses: () => void;
}

const GeneratePhraseAudio: React.FC<GeneratePhraseAudioProps> = ({
  translations,
  bucket,
  updateAudioStatuses,
}) => {
  const supabase = createClient();
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'error'>('default');

  const handleGenerate = async () => {
    setButtonState('loading');

    const genAudioFiles = () =>
      translations.map(async (translation, i) => {
        if (!translation) return;
        const { phraseTarget } = translation;
        try {
          await getAudioFile({
            text: phraseTarget.text as string,
            fileName: (await hashString(phraseTarget.text as string)) + '.mp3',
            supabase,
            bucket,
            setIsLoadingFalse: () => {
              if (i === translations.length - 1) {
                setButtonState('default');
                updateAudioStatuses();
              }
            },
          });
        } catch (e) {
          setButtonState('error');
        }
      });

    await Promise.all(genAudioFiles());
  };

  return (
    <LoadingButton
      variant={'outline'}
      size={'lg'}
      className="w-full  border-2 border-blue-600 rounded-lg text-blue-600 font-medium p-2"
      buttonState={buttonState}
      text={'Generate audio'}
      loadingText="Generating..."
      errorText="Error generating phrases"
      onClick={handleGenerate}
    />
  );
};

export default GeneratePhraseAudio;
