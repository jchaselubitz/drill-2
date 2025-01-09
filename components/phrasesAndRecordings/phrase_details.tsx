import { Iso639LanguageCode, PhraseWithAssociations } from 'kysely-codegen';
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useUserContext } from '@/contexts/user_context';
import { getContentSuggestions, SourceOptionType } from '@/lib/lists';

import ContentRequest from '../ai_elements/content_request';
import PhraseNote from './phrase_note';
import AssociationRow from './translationAndAssociation/association_row';
import LessonRow from './translationAndAssociation/lesson_association_row';
import TranslationRow, { TranslationPhrase } from './translationAndAssociation/translation_row';

interface PhraseDetailsProps {
  phrase: PhraseWithAssociations;
  navigateToPhrase?: (id: string) => void;
}

const PhraseDetails: React.FC<PhraseDetailsProps> = ({ phrase, navigateToPhrase }) => {
  const { userId, userLanguage, prefLanguage } = useUserContext();

  const text = phrase.text;
  const lang = phrase.lang as Iso639LanguageCode;
  const source = phrase.source as SourceOptionType;

  const translationsPhrases =
    (phrase.translations
      ?.map((t: any) => {
        return t?.phrases.map((p: any) => {
          return { ...p, translationId: t.id, lessonId: t.lessonId };
        });
      })
      .flat() as TranslationPhrase[]) || [];

  const associatedPhrases =
    phrase.associations
      ?.map((a: any) => a?.phrases.map((aPhrase: any) => aPhrase))

      .flat() || [];

  const associatedLessons = phrase.translations
    .map((t: any) => {
      if (t.lessonId === null) return [];
      return { id: t.lessonId, title: t.lessonTitle };
    })
    .flat();

  const accordionItemClass = 'border-0 data-[state=open]:mb-3';
  const accordionTriggerClass =
    'p-2 gap-2 w-full rounded-md text-xs font-medium uppercase border-b-0 ';
  return (
    <div className="flex flex-col gap-4">
      {(translationsPhrases.length > 0 || associatedPhrases.length > 0) && (
        <div className="flex flex-col  w-full border-b border-slate-200 p-4  ">
          <Accordion type="multiple" className="pb-1">
            <AccordionItem value="notes" className={accordionItemClass}>
              <AccordionTrigger className={accordionTriggerClass}>Notes</AccordionTrigger>
              <AccordionContent className="p-2">
                <PhraseNote note={phrase.note} phraseId={phrase.id} />
              </AccordionContent>
            </AccordionItem>

            {translationsPhrases && translationsPhrases.length > 0 && (
              <AccordionItem value="translations" className={accordionItemClass}>
                <AccordionTrigger className={accordionTriggerClass}>Translations</AccordionTrigger>
                <AccordionContent className="py-1">
                  {translationsPhrases.map((translationsPhrase: any) => (
                    <TranslationRow
                      key={translationsPhrase.id}
                      translationsPhrase={translationsPhrase}
                      navigateToPhrase={navigateToPhrase}
                      phraseLang={lang}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
            {associatedPhrases && associatedPhrases.length > 0 && (
              <AccordionItem value="associations" className={accordionItemClass}>
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
            {associatedLessons && associatedLessons.length > 0 && (
              <AccordionItem value="associations" className={accordionItemClass}>
                <AccordionTrigger className={accordionTriggerClass}>Lessons</AccordionTrigger>
                <AccordionContent>
                  {associatedLessons.map((lesson: any) => (
                    <LessonRow key={lesson.id} lesson={lesson} />
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
          phraseType={phrase.type}
          primaryPhraseIds={[phrase.id]}
          source={source}
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

export default PhraseDetails;
