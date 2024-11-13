import { PhraseWithTranslations } from 'kysely-codegen';
import { Languages } from 'lucide-react';
import React from 'react';
import { useUserContext } from '@/contexts/user_context';
import { getLangIcon, getLangName, LanguagesISO639 } from '@/lib/lists';
import { cn } from '@/lib/utils';

import ContentRequest from '../ai_elements/content_request';
import TtsButton from '../ai_elements/tts_button';

interface PhraseCardDetailsProps {
  phrase: PhraseWithTranslations;
}

const PhraseCardDetails: React.FC<PhraseCardDetailsProps> = ({ phrase }) => {
  const { userId, userLanguage, prefLanguage } = useUserContext();
  const text = phrase.text;
  const lang = phrase.lang as LanguagesISO639;
  const translationsWherePrimary = phrase.translationsWherePrimary;

  const suggestedTranslationLang = lang === userLanguage ? prefLanguage : userLanguage;

  const primaryPhraseIds = [
    ...translationsWherePrimary?.map((t: any) => {
      return t.phrasePrimaryId;
    }),
    phrase.id,
  ] as string[];

  const bucket = 'text_to_speech';

  return (
    <div>
      {translationsWherePrimary && translationsWherePrimary.length > 0 && (
        <>
          <h3>Translations:</h3>
          <ul className="flex flex-col gap-2">
            {translationsWherePrimary.map((translationsPhrase: any) => (
              <div
                key={translationsPhrase.id}
                className="justify-between border border-gray-400 p-2 mb-2 w-full rounded-md"
              >
                <div className="flex items-center justify-between md:gap-2">
                  {translationsPhrase.text}
                  <div className="w-12">
                    <TtsButton text={translationsPhrase.text} bucket={bucket} lacksAudio={false} />
                  </div>
                </div>
                <hr className="border border-gray-500 my-1" />
                <div className="text-xs flex justify-between gap-3 items-center">
                  <div className="flex gap-1">
                    <div>{getLangIcon(translationsPhrase.lang)}</div>
                    <div>{getLangName(translationsPhrase.lang)}</div>
                  </div>
                  {translationsPhrase.lessonLink && (
                    <a
                      className={cn(
                        'flex p-1 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg gap-1'
                      )}
                      href={translationsPhrase.lessonLink}
                    >
                      <Languages /> <span>{translationsPhrase.lessonTitle}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </ul>
        </>
      )}
      <ContentRequest
        text={text}
        lang={lang}
        userId={userId}
        primaryPhraseIds={primaryPhraseIds}
        source="phrase"
        suggestions={[
          userLanguage
            ? `Translate to ${suggestedTranslationLang && getLangName(suggestedTranslationLang)}`
            : `Translate to`,
          `Create a sentence using`,
        ]}
      />
    </div>
  );
};

export default PhraseCardDetails;
