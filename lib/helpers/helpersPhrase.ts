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

export const capitalizeFirstLetter = (phrase: string): string => {
  return phrase[0].toUpperCase() + phrase.slice(1);
};

export const removeMarkdownNotation = (phrase: string): string => {
  return phrase.replace(/[*_`~]/g, '').trim();
};
