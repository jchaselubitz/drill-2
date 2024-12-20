import { ChatMessage } from '@/components/ai_elements/phrase_chat';
import { HistoryTopicType } from '../actions/actionsHistory';
import { LanguagesISO639 } from '../lists';
import { createClient } from '@/utils/supabase/client';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import {
  phraseGenerationSystemInstructions,
  phraseResponseChecks,
  requestPhraseSuggestions,
} from './promptGenerators';

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

export type gptFormatType = { type: 'json_object' | 'text' | 'json_schema'; json_schema?: any };

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

export const handleGeneratePhrases = async ({
  concept,
  studyLanguage,
  userLanguage,
  level,
}: {
  concept: string;
  studyLanguage: LanguagesISO639;
  userLanguage: LanguagesISO639;
  level: string | null;
}) => {
  const supabase = createClient();

  const { prompt, format } = requestPhraseSuggestions({
    concept,
    studyLanguage,
    userLanguage,
    level: level ?? '',
    numberOfPhrases: process.env.NEXT_PUBLIC_CONTEXT === 'development' ? 2 : 20,
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
    format: zodResponseFormat(HistoryStructure, 'history') as gptFormatType,
    max_tokens: 400,
    temperature: 0.9,
  };
  const { data, error } = await supabase.functions.invoke('gen-text', {
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
  const response = JSON.parse(data.content);
  return response;
};

type TutorPromptProps = {
  relatedPhraseArray: string;
  userLanguage: LanguagesISO639;
  topicLanguage: LanguagesISO639;
  level: string;
  instructions: string;
};

export const generateTutorPrompt = async ({
  relatedPhraseArray,
  userLanguage,
  topicLanguage,
  level,
  instructions,
}: TutorPromptProps) => {
  const messages = [
    {
      role: 'system',
      content: `You are helping the user improve their ${topicLanguage}, which is currently at ${level} (according to the Common European Framework of Reference for Languages) by providing a concise and simple prompt (in ${userLanguage}), just as a tutor might when testing a student. If appropriate to the task, consider the fact that the user is also trying to grasp the usage and meaning following phrases: ${relatedPhraseArray}`,
    },
    {
      role: 'user',
      content: `Prompt me to write a short paragraph about ${instructions} `,
    },
  ];

  const supabase = createClient();
  const modelParams = {
    format: { type: 'text' } as gptFormatType,
    max_tokens: 400,
    temperature: 0.6,
  };
  const { data, error } = await supabase.functions.invoke('gen-text', {
    body: {
      userApiKey: getOpenAiKey(),
      modelSelection: getModelSelection(),
      modelParams: modelParams,
      messages: messages,
    },
  });

  if (error) {
    throw new Error('Error:', error);
  }
  return data.content;
};

export type ReviewUserParagraphSubmissionResponse = {
  correction: string;
  feedback: any;
};
export const reviewUserParagraphSubmission = async ({
  paragraph,
}: {
  paragraph: string;
}): Promise<ReviewUserParagraphSubmissionResponse> => {
  const messages = [
    {
      role: 'system',
      content:
        'The software will submit a paragraph of text written by the user. Return as a JSON object in the following format {"correction": <a version of the user\'s submission with correct vocab and grammar>, "feedback": <feedback on the user\'s paragraph>}. Use markdown where possible to indicate changes in your correction and to provide feedback.',
    },

    {
      role: 'user',
      content:
        'Review the paragraph I wrote and repeat it back to me, but with correct grammar. Try to keep it as close the original in language and structure as possible. Explain your changes as feedback as bullet points where possible.',
    },
    {
      role: 'user',
      content: paragraph,
    },
  ];

  const supabase = createClient();
  const modelParams = {
    format: { type: 'json_object' } as gptFormatType,
    max_tokens: 1000,
    temperature: 0.6,
  };
  const { data, error } = await supabase.functions.invoke('gen-text', {
    body: {
      userApiKey: getOpenAiKey(),
      modelSelection: getModelSelection(),
      modelParams,
      messages,
    },
  });

  if (error) {
    throw new Error('Error:', error);
  }
  return JSON.parse(data.content);
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
