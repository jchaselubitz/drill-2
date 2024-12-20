// ==== Lesson Suggestions ====

import { PhraseType } from '@/app/lessons/(components)/lesson_option';
import type { gptFormatType } from './helpersAI';
import { LanguagesISO639, getLangName } from './lists';

export const lessonGenerationSystemInstructions =
  'Return a JSON that is a list of objects, each including the "title" of the concept and a very short "description". Your response will be parsed as follows: JSON.parse(<your-response>)';

export const requestLessonSuggestions = ({
  language,
  level,
}: {
  language: string;
  level: string;
}): { prompt: string; format: gptFormatType } => {
  const prompt = `I am studying ${language}, and my current skill level is: ${level} (according to the Common European Framework of Reference for Languages). What are the top seven grammatical concepts you think I should drill? `;
  const format = { type: 'json_object' } as gptFormatType;
  return { prompt, format };
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

export const phraseResponseChecks = ({
  response,
  lang1,
  lang2,
}: {
  response: string;
  lang1: string;
  lang2: string;
}): PhraseType[] => {
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

  const prompt = `You are helping a student study ${getLangName(
    studyLanguage
  )} at a level that matches ${level} (according to the Common European Framework of Reference for Languages). You are creating flashcards, with ${getLangName(
    userLanguage
  )} on one side and ${getLangName(
    studyLanguage
  )} on the other. Generate ${numberOfPhrases} long sentences that demonstrate the concept of ${concept} in ${getLangName(
    studyLanguage
  )}. The format of the JSON should be as follows: {${userLanguage}: "sentence", ${studyLanguage}: "sentence"}.`;
  const format = { type: 'json_object' } as gptFormatType;

  return { prompt, format };
};

// ==== Content Request ====

export const contentRequestSystemMessage = (
  command: string | undefined,
  isExplanation: boolean
) => {
  const message =
    'The user will send you a text and a request for how to handle that content. Return as a JSON.';
  if (isExplanation) {
    return (
      message + `Return a JSON with key: "explanation" and value: <a string of the explanation>.`
    );
  }

  if (command === 'Translate') {
    return (
      message +
      `If the user asks for a translation, the return value should include { "input_lang": <the ISO 639-1 code of the text>, "input_text": <text of original>, "output_text": <text of translation>, "output_lang": <the ISO 639-1 code of the translation> }.`
    );
  }

  if (command === 'List' || command === 'Extract') {
    return (
      message +
      `The user will request a list of values. Each key is presented as the title of an expandable list. If the value is an object, the component calls itself again in a nested fashion. If it is a string, it is presented to the user in the same language as the content the user is asking you to list. The goal is to organize the data. `
    );
  }

  if (command === 'Generate') {
    return message + `The user wants you to generate new content based on the text`;
  }

  return `The user will send you a text and a request for how to handle that content. Return as a JSON. The user will often be requesting a list of values. Each key is presented as the title of an expandable list. If the value is an object, the component calls itself again in a nested fashion. If it is a string, it is presented to the user. The goal is to organize the data. If the user asks for an explanation, return a JSON with key: "explanation" and value: <a string of the explanation>. If the user asks for a translation, the return value should include { "input_lang": <the ISO 639-1 code of the text>, "input_text": <text of original>, "output_text": <text of translation>, "output_lang": <the ISO 639-1 code of the translation>}.`;
};

// ==== Tutor Prompts ====
