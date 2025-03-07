// This file exports all the functions and utilities that should be available to dynamic components
import { Selectable } from 'kysely';
import { getLessons } from '@/lib/actions/lessonActions';
import { getSubjects } from '@/lib/actions/lessonActions';
import {
  addTranslation,
  addPhrase,
  AddTranslationProps,
  getPhrases,
} from '@/lib/actions/phraseActions';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import {
  LanguagesISO639,
  getLangName,
  getLangValue,
  getLangIcon,
  SourceOptionType,
} from '@/lib/lists';

import {
  NewAssociation,
  NewPhrase,
  NewPhraseTag,
  NewTag,
  NewTranslation,
  PhraseType,
  Lesson,
} from 'kysely-codegen';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';

// Export the server action directly

type Iso639LanguageCode = 'ISO 639 Language Codes';

type TranslationResponseType = {
  input_text: string;
  input_lang: string;
  output_text: string;
  output_lang: string;
};

type BaseLesson = Selectable<Lesson> & { level: string | null };

type SubjectWithLessons = {
  createdAt: Date;
  id: string;
  lang: Iso639LanguageCode;
  level: string | null;
  name: string | null;
  userId: string | null;
} & {
  lessons: BaseLesson[];
};

export {
  addTranslation,
  addPhrase,
  getHumanDate,
  LanguagesISO639,
  getLangName,
  getLangValue,
  getLangIcon,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
};

export type {
  SourceOptionType,
  PhraseType,
  Iso639LanguageCode,
  NewAssociation,
  NewPhrase,
  NewPhraseTag,
  NewTag,
  NewTranslation,
  AddTranslationProps,
  TranslationResponseType,
  SubjectWithLessons,
};

// Add more utility functions as needed
// export const utils = {
//   capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
//   slugify: (str: string) => str.toLowerCase().replace(/\s+/g, '-'),
// };
