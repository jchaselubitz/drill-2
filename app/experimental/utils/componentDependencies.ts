// This file exports all the functions and utilities that should be available to dynamic components

import { addTranslation, addPhrase } from '@/lib/actions/phraseActions';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import {
  LanguagesISO639,
  getLangName,
  getLangValue,
  getLangIcon,
  getPhraseTypeName,
  getPhraseTypeValue,
  getPhraseTypeIcon,
  PartSpeechType,
  getPartSpeechTypeName,
  getPartSpeechTypeValue,
  getPartSpeechTypeIcon,
  SourceOptionType,
  getContentSuggestions,
} from '@/lib/lists';

import {
  Iso639LanguageCode,
  NewAssociation,
  NewPhrase,
  NewPhraseTag,
  NewTag,
  NewTranslation,
  PhraseType,
  PhraseWithAssociations,
  RevalidationPath,
} from 'kysely-codegen';

// Export the server action directly

export {
  addTranslation,
  addPhrase,
  getHumanDate,
  LanguagesISO639,
  getLangName,
  getLangValue,
  getLangIcon,
  getPhraseTypeName,
  getPhraseTypeValue,
  getPhraseTypeIcon,
  PartSpeechType,
  getPartSpeechTypeName,
  getPartSpeechTypeValue,
  getPartSpeechTypeIcon,
  getContentSuggestions,
};

export type { SourceOptionType, PhraseType };

// Add more utility functions as needed
export const utils = {
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  slugify: (str: string) => str.toLowerCase().replace(/\s+/g, '-'),
};

// You can also export constants that components might need
export const constants = {
  API_ENDPOINTS: {
    TRANSLATIONS: '/api/translations',
    USERS: '/api/users',
  },
  SUPPORTED_LANGUAGES: ['en', 'es', 'de', 'fr'],
};
