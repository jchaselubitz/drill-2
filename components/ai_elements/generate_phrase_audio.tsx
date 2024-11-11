import React, { useState } from 'react';

import { createClient } from '@/utils/supabase/client';
import { getAudioFile } from '@/lib/helpers/helpersAudio';
import { hashString } from '@/lib/helpers/helpersDB';

interface GeneratePhraseAudioProps {
  translations: (Translation | undefined)[];
  bucket: string;
  updateAudioStatuses: () => void;
}

const GeneratePhraseAudio: React.FC<GeneratePhraseAudioProps> = ({
  translations,
  bucket,
  updateAudioStatuses,
}) => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);

    const genAudioFiles = () =>
      translations.map(async (translation, i) => {
        if (!translation) return;
        const { phrase_secondary_id } = translation;
        await getAudioFile({
          text: phrase_secondary_id.text as string,
          fileName: (await hashString(phrase_secondary_id.text as string)) + '.mp3',
          supabase,
          bucket,
          setIsLoadingFalse: () => {
            if (i === translations.length - 1) {
              setIsLoading(false);
              updateAudioStatuses();
            }
          },
        });
      });

    await Promise.all(genAudioFiles());
  };

  return (
    <button
      className="w-full border-2 border-blue-600 rounded-lg text-blue-600 font-medium p-2"
      type="submit"
      onClick={handleGenerate}
    >
      {isLoading ? 'Generating...' : 'Generate Audio'}
    </button>
  );
};

export default GeneratePhraseAudio;
