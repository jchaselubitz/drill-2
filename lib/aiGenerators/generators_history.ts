import { createClient } from '@/utils/supabase/client';
import { getLangName, LanguagesISO639 } from '../lists';
import {
  ChatMessage,
  ExistingHistoryType,
  HistoryStructure,
  HistoryVocabType,
} from './types_generation';
import { getModelSelection, getOpenAiKey } from '../helpers/helpersAI';

export const generateHistory = async ({
  messages,
  existingHistory,
  lang,
  markedOnly,
}: {
  messages: ChatMessage[];
  existingHistory?: ExistingHistoryType;
  lang: LanguagesISO639;
  markedOnly?: boolean;
}): Promise<{
  vocabulary: HistoryVocabType[];
  insights: string;
  concepts: string[];
}> => {
  const supabase = createClient();

  const existingVocab =
    existingHistory?.vocabulary?.map((v) => {
      v.text, v.difficulty;
    }) ?? [];

  const insightState = existingHistory
    ? `Previous Insight State: {Insights you have previously given the user: ${existingHistory.insights}}, {Existing concepts: ${existingHistory.concepts}}, {Existing vocabulary ${JSON.stringify(existingVocab)}}.`
    : null;

  const messagesWithSystem = [
    {
      role: 'system',
      content: `The software will submit insights you previously generated and a message or list of messages including conversation about a subject (${getLangName(lang)}) the user is trying to learn. Return as a JSON object in the following format {"insights": <the insight requested by the user>, "vocabulary": <an array of objects where "text": <phrase in ${lang} >, difficulty: <number less than 4>, "isWord": <return true of the returned text is a single word, false if it is more than one word> partSpeech: <the part of speech associated with that word> >, concepts: <Terms germane to ${getLangName(lang)} included in assistant messages>. Don't refer to yourself or the user.`,
    },

    ...messages,
    {
      role: 'user',
      content: `Identify any grammatical terms and other linguistic concepts germane to ${getLangName(lang)} and update the Concepts list accordingly. For updated vocabulary, add any new words or phrases from the preceding messages ${markedOnly ? "surrounded by '**' (bold in Markdown notation)" : ''}that I did not know or did not understand, but also keep the existing vocabulary. Determine Difficulty by tracking the number of times you have noticed the user struggling with that word. If my recent messages include any of the same words, simply increase the difficulty of those words. Vocabulary should exclude items you put in the Concepts list. For updated insights, look at your existing insights and review the latest messages your updated Concepts list and make a note describing what I struggle with. Assume I will use this note to understand my weaknesses. Take care to highlight any cases where issues from the exiting insights and new insights overlap. ${insightState}. Misspellings are unimportant. Exclude them from the vocabulary and insights.`,
    },
    {
      role: 'user',
      content: 'If my question is NOT about language, please return Previous Insight State ',
    },
  ];

  const modelParams = {
    format: HistoryStructure,
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
