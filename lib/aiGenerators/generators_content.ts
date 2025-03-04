import { createClient } from '@/utils/supabase/client';
import { getOpenAiKey, getModelSelection, gptFormatType } from '../helpers/helpersAI';
import {
  requestNewPhrases,
  phraseGenerationSystemInstructions,
  phraseResponseChecks,
} from '../helpers/promptGenerators';
import { getLangName } from '../lists';
import { TranslationResponseType, TranslationResponseFormat } from './types_generation';
import { Iso639LanguageCode, TranslationWithPhrase } from 'kysely-codegen';

export const handleGeneratePhrases = async ({
  concept,
  studyLanguage,
  userLanguage,
  level,
  isSentences,
  examples,
}: {
  concept: string;
  studyLanguage: Iso639LanguageCode;
  userLanguage: Iso639LanguageCode;
  level: string | null;
  isSentences?: boolean | undefined;
  examples?: (TranslationWithPhrase | undefined)[] | undefined;
}) => {
  const supabase = createClient();

  const prepExamples = () => {
    if (!examples) return undefined;
    const definedExamples = examples.filter((example) => example !== null && example !== undefined);
    if (definedExamples.length === 0) return undefined;
    return definedExamples.map((example) => ({
      phrase_primary: {
        text: example.phraseBase.text,
        lang: example.phraseBase.lang,
      },
      phrase_secondary: {
        text: example.phraseTarget.text,
        lang: example.phraseTarget.lang,
      },
    }));
  };

  const { prompt, format } = requestNewPhrases({
    concept,
    studyLanguage,
    userLanguage,
    level: level ?? '',
    numberOfPhrases: process.env.NEXT_PUBLIC_CONTEXT === 'development' ? 2 : 20,
    isSentences,
    examples: prepExamples(),
  });

  const messages = [
    {
      role: 'system',
      content: phraseGenerationSystemInstructions({
        lang1: userLanguage,
        lang2: studyLanguage,
      }),
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const modelParams = {
    format,
  };
  try {
    const { data } = await supabase.functions.invoke('gen-text', {
      body: {
        userApiKey: getOpenAiKey(),
        modelSelection: getModelSelection(),
        modelParams: modelParams,
        messages: messages,
      },
    });

    return phraseResponseChecks({
      response: data.content,
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

export const generateTranslation = async ({
  subjectText,
  request,
  prefLanguage,
}: {
  subjectText: string;
  request: string;
  prefLanguage: Iso639LanguageCode | undefined | null;
}): Promise<{
  type: 'translation';
  data: TranslationResponseType;
}> => {
  const supabase = createClient();

  const modelParams = {
    format: TranslationResponseFormat,
    max_tokens: 1000,
    temperature: 0.2,
  };

  const preferredLang = getLangName(prefLanguage) ?? null;

  let messages = [
    {
      role: 'system',
      content: `The user wants a translation. Return value is a JSON that includes { "input_lang": <the ISO 639-1 code of the inputText>, "input_text": <the original inputText>, "output_text": <text of translation>, "output_lang": <the ISO 639-1 code of the translation> }.`,
    },
    {
      role: 'user',
      content: `${request} ${preferredLang && `(If I have not specified which language to translate into, use ${preferredLang}.)`} inputText: ${subjectText}`,
    },
  ];

  const { data, error } = await supabase.functions.invoke('gen-text', {
    body: {
      userApiKey: getOpenAiKey(),
      modelSelection: getModelSelection(),
      modelParams,
      messages,
    },
  });

  if (error) {
    throw new Error('generateTranslation Error:', error);
  }
  return { type: 'translation', data: JSON.parse(data.content) };
};

export const generateNestedList = async ({
  subjectText,
  request,
}: {
  subjectText: string;
  request: string;
}): Promise<{ type: 'list'; data: any }> => {
  const supabase = createClient();

  const modelParams = {
    format: { type: 'json_object' } as gptFormatType,
    max_tokens: 1000,
    temperature: 0.2,
  };

  let messages = [
    {
      role: 'system',
      content: `The user will request a list of values. Return a JSON object that is either a list of either strings, or nested objects containing strings. If a value is an object, the front-end component calls itself again with that object in a nested fashion until it reaches a string. If the value is a string, the component will present it to the user as a string. the goal is to organize the data based on the user's request. examples of return format include: { "content": ['phrase1', 'phrase2', phrase3'] } OR 
       , {"content": { 'verbs': ['phrase1', 'phrase2', phrase3'], 'adjectives': ['phrase4', 'phrase5', phrase6'], 'nouns': ['phrase7', 'phrase8', phrase9'] }}. `,
    },
    {
      role: 'user',
      content: `From the following text: '${subjectText}', I would like you to ${request}`,
    },
  ];

  const { data, error } = await supabase.functions.invoke('gen-text', {
    body: {
      userApiKey: getOpenAiKey(),
      modelSelection: getModelSelection(),
      modelParams,
      messages,
    },
  });

  if (error) {
    throw new Error('generateNestedList Error:', error);
  }
  return { type: 'list', data: JSON.parse(data.content) };
};

export const genericContentRequest = async ({
  subjectText,
  request,
}: {
  subjectText: string;
  request: string;
}): Promise<{ type: string; data: string }> => {
  const supabase = createClient();

  const modelParams = {
    format: { type: 'text' } as gptFormatType,
    max_tokens: 1000,
    temperature: 0.9,
  };
  let messages = [
    {
      role: 'system',
      content: `The user will send you inputText and a request for how to handle that content. Return as a JSON. The user wants you to generate new content based on or similar to the inputText.
     
      If the best answer to the user's request is list of values, return a list of either strings, or nested objects containing strings. If a value is an object, the front-end component calls itself again with that object in a nested fashion until it reaches a string. If the value is a string, the component will present it to the user as a string. the goal is to organize the data based on the user's request. examples: { "content": ['phrase1', 'phrase2', phrase3'] } OR 
      , {"content": { 'verbs': ['phrase1', 'phrase2', phrase3'], 'adjectives': ['phrase4', 'phrase5', phrase6'], 'nouns': ['phrase7', 'phrase8', phrase9'] }}. 
      
      If the user asks for an explanation, return a JSON with key: "explanation" and value: <a string of the explanation>. 
      
      If the user asks for a translation, the return value should include { "input_lang": <the ISO 639-1 code of the text>, "input_text": <text of inputText>, "output_text": <text of translation>, "output_lang": <the ISO 639-1 code of the translation>}.`,
    },
    {
      role: 'user',
      content: `inputText: ${subjectText} `,
    },
    {
      role: 'user',
      content: `My request: ${request}`,
    },
  ];

  const { data, error } = await supabase.functions.invoke('gen-text', {
    body: {
      userApiKey: getOpenAiKey(),
      modelSelection: getModelSelection(),
      modelParams,
      messages,
    },
  });

  if (error) {
    throw new Error('genericContentRequest Error:', error);
  }
  if (data.content.includes('explanation')) {
    return { type: 'explanation', data: JSON.parse(data.content.explanation) };
  }
  if (data.content.includes('output_lang')) {
    return { type: 'translation', data: JSON.parse(data.content) };
  }
  return { type: 'general', data: JSON.parse(data.content) };
};
