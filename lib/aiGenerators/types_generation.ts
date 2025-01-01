import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { LanguagesISO639 } from '../lists';
import React from 'react';

export type GenResponseType = {
  type: string;
  data: any | TranslationResponseType;
};

export type HistoryVocabType = {
  text: string;
  difficulty: number;
  partSpeech: string;
  id?: string;
};
export type ExistingHistoryType = {
  concepts: string[] | null;
  insights?: string;
  vocabulary?: HistoryVocabType[];
};

export const TranslationResponseFormat = zodResponseFormat(
  z.object({
    input_text: z.string(),
    input_lang: z.nativeEnum(LanguagesISO639),
    output_text: z.string(),
    output_lang: z.nativeEnum(LanguagesISO639),
  }),
  'translation'
);

export const ExplanationResponseFormat = zodResponseFormat(
  z.object({
    explanation: z.string(),
  }),
  'explanation'
);

export const CorrectionStructure = zodResponseFormat(
  z.object({
    feedback: z.string(),
    correction: z.string(),
  }),
  'correction'
);

export const HistoryStructure = zodResponseFormat(
  z.object({
    vocabulary: z.array(
      z.object({ text: z.string(), difficulty: z.number(), partSpeech: z.string() })
    ),
    insights: z.string(),
    concepts: z.array(z.string()),
  }),
  'history'
);

export type TranslationResponseType = {
  input_text: string;
  input_lang: string;
  output_text: string;
  output_lang: string;
};

export interface DynamicChatMessage {
  role: string;
  content: string | React.ReactNode;
  type: 'string' | 'jsx';
}

export interface ChatMessage {
  role: string;
  content: string;
}
