import { ChatMessage } from '@/components/ai_elements/phrase_chat';
import { getLangName, LanguagesISO639 } from '../lists';
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

export type HistoryVocabType = { word: string; rank: number; partSpeech: string };
export type ExistingHistoryType = {
  concepts: string[] | null;
  insights?: string;
  vocabulary?: HistoryVocabType[];
};

export const generateHistory = async ({
  messages,
  existingHistory,
  lang,
}: {
  messages: ChatMessage[];
  existingHistory?: ExistingHistoryType;
  lang: LanguagesISO639;
}): Promise<{
  vocabulary: HistoryVocabType[];
  insights: string;
  concepts: string[];
}> => {
  const supabase = createClient();

  const HistoryStructure = z.object({
    vocabulary: z.array(z.object({ word: z.string(), rank: z.number(), partSpeech: z.string() })),
    insights: z.string(),
    concepts: z.array(z.string()),
  });

  const insightState = existingHistory
    ? `Previous Insight State: {Insights you have previously given the user: ${existingHistory.insights}}, {Existing concepts: ${existingHistory.concepts}}, {Existing vocabulary ${JSON.stringify(existingHistory.vocabulary)}}.`
    : null;

  const messagesWithSystem = [
    {
      role: 'system',
      content: `The software will submit insights you previously generated and a message or list of messages including conversation about a subject (${getLangName(lang)}) the user is trying to learn. Return as a JSON object in the following format {"insights": <the insight requested by the user>, "vocabulary": <an array of objects where "word": <word in ${lang} >, rank: <the number of times you have noticed the user struggling with that word> partSpeech: <the part of speech associated with that word>>, concepts: <Terms germane to ${getLangName(lang)} included in assistant messages>. Don't refer to yourself or the user.`,
    },

    ...messages,
    {
      role: 'user',
      content: `Identify any grammatical terms and other linguistic concepts germane to ${getLangName(lang)} and update the Concepts list accordingly. For updated vocabulary, add any new words from the preceding messages you think I want to learn, but also keep the existing vocabulary. The vocab list should show each word only once. If my recent messages include any of the same words, simply increase the rank of those words. Vocabulary should exclude items you put in the Concepts list. For updated insights, look at your existing insights and review the latest messages your updated Concepts list and make a note describing what I struggle with. Assume I will use this note to understand my weaknesses. Take care to highlight any cases where issues from the exiting insights and new insights overlap. ${insightState}. Misspellings are unimportant. Exclude them from the vocabulary and insights.`,
    },
    {
      role: 'user',
      content: 'If my question is NOT about language, please return Previous Insight State ',
    },
  ];

  const modelParams = {
    format: zodResponseFormat(HistoryStructure, 'history') as gptFormatType,
    max_tokens: 1000,
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
      content: `You are helping the user improve their ${topicLanguage} by providing a concise and simple prompt (in ${userLanguage}), just as a tutor might when testing a student. `,
    },
    {
      role: 'user',
      content: `Prompt me to write a short paragraph about ${instructions}. Make it specific. This prompt should match my level, which is currently ${level} (according to the Common European Framework of Reference for Languages). Lower levels should result in shorter, simpler prompts. Higher levels should result in longer, more complicated prompts that include a person or people, a place, and a problem to solve. If appropriate to the task, consider the fact that I am also trying to grasp the usage and meaning following phrases: ${relatedPhraseArray}`,
    },
  ];

  const supabase = createClient();
  const modelParams = {
    format: { type: 'text' } as gptFormatType,
    max_tokens: 500,
    temperature: 0.4,
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

export const changePromptLength = async ({
  prompt,
  length,
}: {
  prompt: string;
  length: 'shorter' | 'longer';
}): Promise<string> => {
  const messages = [
    {
      role: 'system',
      content:
        'The software will shorten or lengthen a prompt. Return a prompt that is either shorter or longer than the original.',
    },
    {
      role: 'user',
      content: `I have been given this prompt: ${prompt}. It should still be a prompt with the same structure and subject matter, but make it two sentences ${length}?`,
    },
  ];

  const supabase = createClient();
  const modelParams = {
    format: { type: 'text' } as gptFormatType,
    max_tokens: 500,
    temperature: 0.4,
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
  feedback: string;
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
        'The software will submit a paragraph of text written by the user. Return as a JSON object in the following format {"correction": <a version of the user\'s submission with correct vocab and grammar>, "feedback": < bullet point feedback on the user\'s paragraph>}. Use markdown where possible to indicate changes in your correction and to provide feedback.',
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

  const CorrectionStructure = z.object({
    feedback: z.string(),
    correction: z.string(),
  });
  const modelParams = {
    format: zodResponseFormat(CorrectionStructure, 'correction') as gptFormatType,
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
