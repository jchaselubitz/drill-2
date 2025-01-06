import { createClient } from '@/utils/supabase/client';
import { CorrectionStructure, ExplanationResponseFormat } from './types_generation';
import { getModelSelection, getOpenAiKey, gptFormatType } from '../helpers/helpersAI';
import { Iso639LanguageCode } from 'kysely-codegen';

type TutorPromptProps = {
  relatedPhraseArray: string;
  userLanguage: Iso639LanguageCode;
  topicLanguage: Iso639LanguageCode;
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
    throw new Error('changePromptLength Error:', error);
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
        'The software will submit a paragraph of text written by the user. Return as a JSON object in the following format {"correction": <a version of the user\'s submission with correct vocab and grammar>, "feedback": < bullet point feedback on the user\'s paragraph>}. Use Markdown to indicate changes in your correction and to provide feedback.',
    },

    {
      role: 'user',
      content: `Review the paragraph I wrote and repeat it back to me, but with correct grammar, using Markdown to indicate changes. Try to keep it as close the original in language and structure as possible so I can learn from my mistakes. Explain your feedback as bullet points. I want to understand the language's specific grammar rules, so instead of saying something is "correct" or "proper", explain the rule that makes it so.`,
    },
    {
      role: 'user',
      content: paragraph,
    },
  ];

  const supabase = createClient();

  const modelParams = {
    format: CorrectionStructure,
    max_tokens: 2000,
    temperature: 0.7,
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
    throw new Error('reviewUserParagraphSubmission Error:', error);
  }
  return JSON.parse(data.content);
};

export const generateExplanation = async ({
  subjectText,
  request,
  userLanguage,
}: {
  subjectText: string;
  request: string;
  userLanguage: Iso639LanguageCode | undefined | null;
}): Promise<{ type: string; data: string }> => {
  const supabase = createClient();

  const modelParams = {
    format: ExplanationResponseFormat,
    max_tokens: 1000,
    temperature: 0.9,
  };

  let messages = [
    {
      role: 'system',
      content: `Return a JSON. The content of every response should include include two key/value pairs: {type: "message" | "translation" | "list" , data: <contentData>}. The software consuming your response will use the type to determine how to present the data
      
      Return a JSON with key: "explanation" and value: <a string of the explanation in ${userLanguage}>.`,
    },
    {
      role: 'user',
      content: `Explain: ${request} in ${userLanguage} about the following: '${subjectText}',`,
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
    throw new Error('generateExplanation Error:', error);
  }
  return { type: 'explanation', data: JSON.parse(data.content).explanation };
};
