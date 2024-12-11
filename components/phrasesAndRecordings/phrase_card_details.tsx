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
import AssociationRow from './translationAndAssociation/association_row';
import TranslationRow from './translationAndAssociation/translation_row';

interface PhraseCardDetailsProps {
  phrase: PhraseWithAssociations;
  setSelectedPhraseId: (id: string) => void;
}

const PhraseCardDetails: React.FC<PhraseCardDetailsProps> = ({ phrase, setSelectedPhraseId }) => {
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

  const accordionClass = 'p-2 mb-2 w-full rounded-md text-xs font-medium uppercase border-b-0';
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col w-full border-b border-slate-200 p-4 py-6">
        <Accordion type="single" collapsible>
          {translationsPhrases && translationsPhrases.length > 0 && (
            <AccordionItem value="translations" className="border-0">
              <AccordionTrigger className={accordionClass}>Translations</AccordionTrigger>
              <AccordionContent>
                {translationsPhrases.map((translationsPhrase: any) => (
                  <TranslationRow
                    key={translationsPhrase.id}
                    translationsPhrase={translationsPhrase}
                    setSelectedPhraseId={setSelectedPhraseId}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          )}
          {associatedPhrases && associatedPhrases.length > 0 && (
            <AccordionItem value="associations">
              <AccordionTrigger className={accordionClass}>Associations</AccordionTrigger>
              <AccordionContent>
                {associatedPhrases.map((associatedPhrase: any) => (
                  <AssociationRow
                    key={associatedPhrase.id}
                    associatedPhrase={associatedPhrase}
                    setSelectedPhraseId={setSelectedPhraseId}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
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
