'use client';
import { BasePhrase, Iso639LanguageCode, TranslationWithPhrase } from 'kysely-codegen';
import Link from 'next/link';
import React from 'react';
import TtsButton from '@/components/ai_elements/tts_button';
import { Input } from '@/components/ui/input';
import { updatePhrase } from '@/lib/actions/phraseActions';
import { getLangName } from '@/lib/lists';

interface PhraseListProps {
  side1: Iso639LanguageCode;
  side2: Iso639LanguageCode;
  translations: TranslationWithPhrase[];
  translationsWithoutAudio: (TranslationWithPhrase | undefined)[] | undefined;
  bucket: string;
}

const labelClass = 'text-sm md:text-base font-bold text-gray-500 whitespace-nowrap';
const rowInputClass = 'w-64 md:w-full';

const PhraseList: React.FC<PhraseListProps> = ({
  side1,
  side2,
  translations,
  translationsWithoutAudio,
  bucket,
}) => {
  const handleBlur = async (phraseId: string, text: string) => {
    await updatePhrase({ phraseId, text });
  };

  if (!translations || translations.length === 0) {
    return (
      <div>
        No translations found. Either add some from your{' '}
        <Link className="underline" href="/library">
          library
        </Link>
        , or generate some using the button above.
      </div>
    );
  }

  const getSidePhrase = (translation: TranslationWithPhrase, side: 1 | 2): BasePhrase => {
    const phrases = [translation?.phraseBase, translation?.phraseTarget];
    const phrase = phrases.find((p) => p?.lang === (side === 1 ? side1 : side2));
    if (!phrase) {
      throw Error('missing phrase');
    }
    return phrase;
  };

  return (
    <div className="flex md:w-full overflow-x-auto">
      <table className="md:w-full">
        <thead>
          <tr>
            <th className={labelClass}>{getLangName(side1)}</th>
            <th className={labelClass}>{getLangName(side2)}</th>
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
                      defaultValue={getSidePhrase(translation, 1).text ?? ''}
                      onBlur={(event) =>
                        handleBlur(getSidePhrase(translation, 1).id, event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      className={rowInputClass}
                      defaultValue={getSidePhrase(translation, 2).text ?? ''}
                      onBlur={(event) =>
                        handleBlur(getSidePhrase(translation, 2).id, event.target.value)
                      }
                    />
                  </td>
                  <td className="px-2">
                    <TtsButton
                      text={getSidePhrase(translation, 2).text}
                      bucket={bucket}
                      lacksAudio={
                        translationsWithoutAudio
                          ? translationsWithoutAudio.some((twa) => twa?.id === translation.id)
                          : true
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
