import { PhraseWithAssociations } from 'kysely-codegen';
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useUserContext } from '@/contexts/user_context';
import { getContentSuggestions, LanguagesISO639 } from '@/lib/lists';

import ContentRequest from '../ai_elements/content_request';
import { Input } from '../ui/input';
import PhraseNote from './phrase_note';
import AssociationRow from './translationAndAssociation/association_row';
import TranslationRow from './translationAndAssociation/translation_row';

interface PhraseCardDetailsProps {
  phrase: PhraseWithAssociations;
  navigateToPhrase?: (id: string) => void;
}

const PhraseCardDetails: React.FC<PhraseCardDetailsProps> = ({ phrase, navigateToPhrase }) => {
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

  const accordianItemClass = 'border-0 data-[state=open]:mb-3';
  const accordionTriggerClass =
    'p-2 gap-2 w-full rounded-md text-xs font-medium uppercase border-b-0 ';
  return (
    <div className="flex flex-col gap-4">
      {(translationsPhrases.length > 0 || associatedPhrases.length > 0) && (
        <div className="flex flex-col  w-full border-b border-slate-200 p-4  ">
          <Accordion type="multiple" className="pb-1">
            <AccordionItem value="notes" className={accordianItemClass}>
              <AccordionTrigger className={accordionTriggerClass}>Notes</AccordionTrigger>
              <AccordionContent className="p-2">
                <PhraseNote note={phrase.note} phraseId={phrase.id} />
              </AccordionContent>
            </AccordionItem>

            {translationsPhrases && translationsPhrases.length > 0 && (
              <AccordionItem value="translations" className={accordianItemClass}>
                <AccordionTrigger className={accordionTriggerClass}>Translations</AccordionTrigger>
                <AccordionContent className="py-1 ">
                  {translationsPhrases.map((translationsPhrase: any) => (
                    <TranslationRow
                      key={translationsPhrase.id}
                      translationsPhrase={translationsPhrase}
                      navigateToPhrase={navigateToPhrase}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
            {associatedPhrases && associatedPhrases.length > 0 && (
              <AccordionItem value="associations" className={accordianItemClass}>
                <AccordionTrigger className={accordionTriggerClass}>Associations</AccordionTrigger>
                <AccordionContent>
                  {associatedPhrases.map((associatedPhrase: any) => (
                    <AssociationRow
                      key={associatedPhrase.id}
                      associatedPhrase={associatedPhrase}
                      navigateToPhrase={navigateToPhrase}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}
      <div className="p-4">
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
    </div>
  );
};

export default PhraseCardDetails;
