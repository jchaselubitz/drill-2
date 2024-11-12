import React from 'react';
import TtsButton from '@/components/ai_elements/tts_button';
import { TranslationWithPhrase } from 'kysely-codegen';
import { getLangName } from '@/lib/lists';
import { Input } from '@/components/ui/input';
import { updatePhrase } from '@/lib/actions/phraseActions';

interface PhraseListProps {
  translations: TranslationWithPhrase[];
  translationsWithoutAudio: (TranslationWithPhrase | undefined)[] | undefined;

  bucket: string;
}

const labelClass = 'text-sm md:text-base font-bold text-gray-500 whitespace-nowrap';
const rowInputClass = 'w-64 md:w-full';

const PhraseList: React.FC<PhraseListProps> = ({
  translations,
  translationsWithoutAudio,
  bucket,
}) => {
  const handleBlur = async (phraseId: string, text: string) => {
    await updatePhrase({ phraseId, text });
  };

  if (!translations || translations.length === 0) {
    return <div>No translations found</div>;
  }

  return (
    <div className="flex md:w-full overflow-x-auto">
      <table className="md:w-full">
        <thead>
          <tr>
            <th className={labelClass}>{getLangName(translations[0]?.phrasePrimary.lang)}</th>
            <th className={labelClass}>{getLangName(translations[0]?.phraseSecondary.lang)}</th>
          </tr>
        </thead>
        <tbody>
          {translations.map(
            (translation) =>
              translation && (
                <tr key={translation.id} className="text-center">
                  <td>
                    <Input
                      className={rowInputClass}
                      defaultValue={translation.phrasePrimary.text ?? ''}
                      onBlur={(event) =>
                        handleBlur(translation.phrasePrimary.id, event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      className={rowInputClass}
                      defaultValue={translation.phraseSecondary.text ?? ''}
                      onBlur={(event) =>
                        handleBlur(translation.phraseSecondary.id, event.target.value)
                      }
                    />
                  </td>
                  <td className="px-2">
                    <TtsButton
                      text={translation.phraseSecondary.text}
                      bucket={bucket}
                      lacksAudio={
                        translationsWithoutAudio
                          ? translationsWithoutAudio.some((twa) => twa?.id === translation.id)
                          : false
                      }
                    />
                  </td>
                </tr>
              )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PhraseList;
