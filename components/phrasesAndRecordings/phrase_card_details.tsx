import { PhraseWithAssociations } from 'kysely-codegen';
import { Languages } from 'lucide-react';
import React from 'react';
import { useUserContext } from '@/contexts/user_context';
import { getContentSuggestions, getLangIcon, getLangName, LanguagesISO639 } from '@/lib/lists';
import { cn } from '@/lib/utils';

import ContentRequest from '../ai_elements/content_request';
import TtsButton from '../ai_elements/tts_button';

interface PhraseCardDetailsProps {
  phrase: PhraseWithAssociations;
  toggleExpanded: (id: string) => void;
}

const PhraseCardDetails: React.FC<PhraseCardDetailsProps> = ({ phrase, toggleExpanded }) => {
  const { userId, userLanguage, prefLanguage } = useUserContext();
  const text = phrase.text;
  const lang = phrase.lang as LanguagesISO639;
  const translationsPhrases =
    phrase.translations
      ?.map((t: any) => t?.phrases)
      .map((p) => p)
      .flat() || [];

  const associatedPhrases =
    phrase.associations
      ?.map((t: any) => t?.phrases)
      .map((p) => p)
      .flat() || [];

  const bucket = 'text_to_speech';

  return (
    <div className="flex flex-col gap-4">
      {translationsPhrases && translationsPhrases.length > 0 && (
        <div>
          <h3 className="mb-2 font-bold">Translations:</h3>
          <ul className="flex flex-col gap-2">
            {translationsPhrases.map((translationsPhrase: any) => (
              <div
                key={translationsPhrase.id}
                className="justify-between border border-gray-400 p-2 mb-2 w-full rounded-md"
              >
                <div className="flex items-center justify-between md:gap-2">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleExpanded(translationsPhrase.id)}
                  >
                    {translationsPhrase.text}
                  </button>
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
        </div>
      )}
      {associatedPhrases && associatedPhrases.length > 0 && (
        <div>
          <h3 className="mb-2 font-bold">Associations:</h3>
          <ul className="flex flex-col gap-2">
            {associatedPhrases.map((associatedPhrase: any) => (
              <div
                key={associatedPhrase.id}
                className="justify-between border border-gray-400 p-2 mb-2 w-full rounded-md"
              >
                <div className="flex items-center justify-between md:gap-2">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleExpanded(associatedPhrase.id)}
                  >
                    {associatedPhrase.text}
                  </button>
                  <div className="w-12">
                    <TtsButton text={associatedPhrase.text} bucket={bucket} lacksAudio={false} />
                  </div>
                </div>
                <hr className="border border-gray-500 my-1" />
                <div className="text-xs flex justify-between gap-3 items-center">
                  <div className="flex gap-1">
                    <div>{getLangIcon(associatedPhrase.lang)}</div>
                    <div>{getLangName(associatedPhrase.lang)}</div>
                  </div>
                  {associatedPhrase.lessonLink && (
                    <a
                      className={cn(
                        'flex p-1 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg gap-1'
                      )}
                      href={associatedPhrase.lessonLink}
                    >
                      <Languages /> <span>{associatedPhrase.lessonTitle}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </ul>
        </div>
      )}
      <ContentRequest
        text={text}
        lang={lang}
        userId={userId}
        phraseId={phrase.id}
        primaryPhraseIds={[phrase.id]}
        source="phrase"
        suggestions={getContentSuggestions({
          userLanguage,
          prefLanguage,
          contentLang: lang,
          suggestionList: [`Create a sentence using`],
        })}
      />
    </div>
  );
};

export default PhraseCardDetails;
