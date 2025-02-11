// ==== Lesson Suggestions ====

import { PhraseType } from '@/app/lessons/(components)/lesson_option';
import type { gptFormatType } from './helpersAI';

import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { getLangName, LanguagesISO639 } from '../lists';
import { Iso639LanguageCode } from 'kysely-codegen';

export const requestLessonSuggestions = ({
  language,
  level,
}: {
  language: string;
  level: string;
}): { prompt: string; format: gptFormatType } => {
  const aiResponseFormat = zodResponseFormat(
    z.object({
      concepts: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
        })
      ),
    }),
    'suggestions'
  );

  const prompt = `I am studying ${language}, and my current skill level is: ${level} (according to the Common European Framework of Reference for Languages). What are the top seven grammatical concepts you think I should drill? `;

  return { prompt, format: aiResponseFormat };
};

// ==== Card Content Generation ====

export const phraseGenerationSystemInstructions = ({
  lang1,
  lang2,
}: {
  lang1: Iso639LanguageCode;
  lang2: Iso639LanguageCode;
}) =>
  `The student will ask you for a list of examples, which will be added to flashcards. Your response will be parsed as follows: JSON.parse(<your-response>). Return a "phrases" JSON that is a list of objects, each with the following keys: phrase_primary, phrase_secondary. The phrase_primary is the ${lang1} phrase, and the phrase_secondary is the ${lang2} phrase. The format should therefore be: [{phrase_primary: {text: "phrase1", lang:${lang1}}, phrase_secondary: {text: "phrase2", lang:${lang2}}}, ...]. Please note that a "phrase" can be a single word if the user indicates that.`;

export const phraseResponseChecks = ({ response }: { response: string }): PhraseType[] => {
  if (response === '') {
    throw Error('No phrases generated. Try again.');
  }

  const phraseObject = JSON.parse(response);

  if (!phraseObject.phrases) {
    alert('OpenAI returned wrong format. This happens sometimes. Please try again.');
    throw Error('OpenAI returned wrong format (not .phrases). Please try again.');
  }
  const phraseArray = phraseObject.phrases;
  if (phraseArray.length === 0) {
    throw Error('No phrases generated. Try again.');
  }
  if (!phraseArray[0].phrase_primary.lang || !phraseArray[0].phrase_secondary.text) {
    alert('OpenAI returned wrong format. This happens sometimes. Please try again.');
    throw Error(
      'OpenAI returned wrong format (not phrase_primary/phrase_secondary). Please try again.'
    );
  }
  return phraseArray;
};

type PhraseExampleType = {
  phrase_primary: { text: string; lang: Iso639LanguageCode };
  phrase_secondary: { text: string; lang: Iso639LanguageCode };
};

export const requestNewPhrases = ({
  concept,
  userLanguage,
  studyLanguage,
  level,
  numberOfPhrases,
  isSentences,
  examples,
}: {
  concept: string;
  studyLanguage: Iso639LanguageCode | '';
  userLanguage: Iso639LanguageCode | '';
  level: string;
  numberOfPhrases: number;
  isSentences: boolean | undefined;
  examples: PhraseExampleType[] | undefined;
}): { prompt: string; format: gptFormatType } => {
  if (studyLanguage === '' || concept === '' || level === '' || userLanguage === '') {
    throw new Error('studyLanguage, concept, or level is empty');
  }

  const aiResponseFormat = zodResponseFormat(
    z.object({
      phrases: z.array(
        z.object({
          phrase_primary: z.object({ text: z.string(), lang: z.nativeEnum(LanguagesISO639) }),
          phrase_secondary: z.object({ text: z.string(), lang: z.nativeEnum(LanguagesISO639) }),
        })
      ),
    }),
    'phrases'
  );

  const exampleComponent = `Think of things related to ${concept} and store those in a var called 'CONCEPTS'. Consider these examples: ${JSON.stringify(examples)}. Are phrase_secondary values are single words or sentences? If sentences, your response should also be sentences. If words, then words. Do not repeat the same content as in the examples. Generate the appropriate content about CONCEPTS`;

  const phraseTypeComponent =
    isSentences === undefined
      ? `First, consider the concept (${concept}) and determine if the response objects should be words or phrases`
      : isSentences
        ? `Generate long sentences at the appropriate length for level: ${level} that demonstrate the concept of: ${concept}`
        : `Generate words broadly related to the concept of: ${concept}. It's ok if they are not directly related.`;

  const prompt = `You are helping a student study ${getLangName(
    studyLanguage
  )} at a level that matches ${level} (according to the Common European Framework of Reference for Languages). You are creating flashcards, with ${getLangName(
    userLanguage
  )} on side 1 and ${getLangName(
    studyLanguage
  )} on side 2. ${examples ? exampleComponent : phraseTypeComponent} in ${getLangName(
    studyLanguage
  )}. You should return  ${numberOfPhrases} items. The format of the JSON should be as follows: {${userLanguage}: "item", ${studyLanguage}: "item"}.`;

  return { prompt, format: aiResponseFormat };
};

// ==== Content Request ====

// ==== Tutor Prompts ====
