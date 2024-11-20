import { PhraseType } from 'kysely-codegen';

export const isOneWord = (phrase: string): boolean => {
  return phrase.trim().split(' ').length === 1;
};

export const getPhraseType = (phrase: string | null): PhraseType => {
  if (!phrase) {
    return 'phrase';
  }
  return isOneWord(phrase) ? 'word' : 'phrase';
};
