// ==== Lesson Suggestions ====

import { PhraseType } from '@/app/lessons/(components)/lesson_option';
import type { gptFormatType } from './helpersAI';

import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { getLangName, LanguagesISO639 } from '../lists';

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
  lang1: LanguagesISO639;
  lang2: LanguagesISO639;
}) =>
  `The student will ask you for a list of examples, which will be added to flashcards. Your response will be parsed as follows: JSON.parse(<your-response>). Return a "phrases" JSON that is a list of objects, each with the following keys: phrase_primary, phrase_secondary. The phrase_primary is the ${lang1} phrase, and the phrase_secondary is the ${lang2} phrase. The format should therefore be: [{phrase_primary: {text: "phrase1", lang:${lang1}}, phrase_secondary: {text: "phrase2", lang:${lang2}}}, ...]`;

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

export const requestPhraseSuggestions = ({
  concept,
  userLanguage,
  studyLanguage,
  level,
  numberOfPhrases,
}: {
  concept: string;
  studyLanguage: LanguagesISO639 | '';
  userLanguage: LanguagesISO639 | '';
  level: string;
  numberOfPhrases: number;
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

  const prompt = `You are helping a student study ${getLangName(
    studyLanguage
  )} at a level that matches ${level} (according to the Common European Framework of Reference for Languages). You are creating flashcards, with ${getLangName(
    userLanguage
  )} on one side and ${getLangName(
    studyLanguage
  )} on the other. Generate ${numberOfPhrases} long sentences that demonstrate the concept of ${concept} in ${getLangName(
    studyLanguage
  )}. The format of the JSON should be as follows: {${userLanguage}: "sentence", ${studyLanguage}: "sentence"}.`;

  return { prompt, format: aiResponseFormat };
};

// ==== Content Request ====

// ==== Tutor Prompts ====
