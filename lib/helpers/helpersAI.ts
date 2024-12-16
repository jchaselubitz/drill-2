import { ChatMessage } from '@/components/ai_elements/phrase_chat';
import { HistoryTopicType } from '../actions/actionsHistory';
import { LanguagesISO639 } from '../lists';
import { createClient } from '@/utils/supabase/client';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

export type AiMessage = {
  role: string;
  content: string;
};

//this is mirrored in supabase/functions/_shared.ts
export enum OpenAiModel {
  'gpt4oMini' = 'gpt-4o-mini',
  'gpt4' = 'gpt-4o',
}

export const getModelSelection = () => {
  if (typeof window !== 'undefined') {
    const selection = localStorage.getItem('OpenAIModel') ?? 'gpt4oMini';
    return selection === 'gpt4' ? OpenAiModel.gpt4 : OpenAiModel.gpt4oMini;
  }
};
export const getOpenAiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('OpenAIKey') ?? undefined;
  }
};

export type gptFormatType = 'json_object' | 'text';
export type ModelParamsType = {
  format: gptFormatType;
  presence_penalty?: number;
  frequency_penalty?: number;
  temperature?: number;
  max_tokens?: number;
};

export type AiGenerateProps = {
  modelParams: ModelParamsType;
  messages: AiMessage[];
  dbParams?: any;
  dbCallback?: any;
};

export const selectSystemMessage = (command: string | undefined, isExplanation: boolean) => {
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

export const generateHistory = async (
  messages: ChatMessage[]
): Promise<{ topic: HistoryTopicType; lang: LanguagesISO639; insight: string }> => {
  const supabase = createClient();

  const HistoryStructure = z.object({
    topic: z.string(),
    lang: z.string(),
    insight: z.string(),
  });

  const messagesWithSystem = [
    {
      role: 'system',
      content:
        'The software will submit a message or list of messages including conversation about a subject the user is trying to learn. Return as a JSON object in the following format {"insight": <the insight requested by the user in the last message>, "lang" <the ISO 639-1 code of the language the user is studying>, "topic": <return one of the following that best matches the insight: "grammar" | "vocab" | "preposition" }.',
    },
    ...messages,
    {
      role: 'user',
      content: `review the previous messages and identify the grammatical concepts and vocabulary the I am trying to learn and make a concise note describing what I struggle with. The insight you return should include only the substance. Don't refer to yourself or the user.`,
    },
  ];

  const modelParams = {
    format: zodResponseFormat(HistoryStructure, 'history'),
    max_tokens: 1000,
    temperature: 0.9,
  };
  const { data, error } = await supabase.functions.invoke('gen-history', {
    body: {
      userApiKey: getOpenAiKey(),
      modelSelection: getModelSelection(),
      modelParams: modelParams,
      messages: messagesWithSystem,
    },
  });

  if (error) {
    throw new Error('Error:', error);
  }
  const response = JSON.parse(data);
  return response;
};

// const AITESTSTRING = `{"concepts":[
//   {
//     "title": "Noun Gender",
//     "description": "Learn the gender (masculine, feminine, or neuter) of German nouns."
//   },
//   {
//     "title": "Verb Conjugation",
//     "description": "Practice conjugating regular and irregular verbs in different tenses."
//   },
//   {
//     "title": "Cases (Nominative, Accusative, Dative, Genitive)",
//     "description": "Understand how to use different cases for nouns, pronouns, and articles."
//   },
//   {
//     "title": "Word Order",
//     "description": "Master the correct word order in German sentences, including main and subordinate clauses."
//   },
//   {
//     "title": "Modal Verbs",
//     "description": "Learn how to use modal verbs like können, müssen, wollen, etc. in different contexts."
//   },
//   {
//     "title": "Relative Clauses",
//     "description": "Practice constructing and using relative clauses to provide additional information."
//   },
//   {
//     "title": "Prepositions",
//     "description": "Familiarize yourself with common prepositions and their usage in different contexts."
//   }
// ]}`;

// export const MOCK_ARBITRARY_RESPONSE = `{"samplekey":{"nouns": ["Uhr", "Nachrichten", "Übersicht", "SPD", "FDP", "Treffen", "Berlin", "Spitzenkandidaten", "Europawahl", "Proteste", "Rechtsextremismus", "Vorwürfen", "Mitarbeiter", "UNO-Flüchtlingshilfswerks", "Palästinenser", "Generalsekretär", "Vereinten", "Nationen", "Konsequenzen", "Meldungen"],
// "verbs": ["bestimmen", "geplant", "hat", "angekündigt"],
// "adjectives": ["getrennten", "wieder", "vielerorts", "guterresch", "Einzelnen"]}}`;
