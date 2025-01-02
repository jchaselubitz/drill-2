import { PhraseType } from 'kysely-codegen';
import { Ear, LucideIcon, LucideWholeWord, Text } from 'lucide-react';

export enum LanguagesISO639 {
  'German' = 'de',
  'English' = 'en',
  'French' = 'fr',
  'Spanish' = 'es',
  'Italian' = 'it',
  'Portuguese' = 'pt',
  'Dutch' = 'nl',
  'Swedish' = 'sv',
  'Polish' = 'pl',
  'Romanian' = 'ro',
  'Czech' = 'cs',
  'Danish' = 'da',
  'Hungarian' = 'hu',
  'Finnish' = 'fi',
  'Slovak' = 'sk',
  'Slovenian' = 'sl',
  'Estonian' = 'et',
  'Greek' = 'el',
  'Bulgarian' = 'bg',
  'Croatian' = 'hr',
  'Lithuanian' = 'lt',
  'Latvian' = 'lv',
  'Maltese' = 'mt',
  'Norwegian' = 'no',
  'Turkish' = 'tr',
  'Ukrainian' = 'uk',
  'Hebrew' = 'he',
  'Hindi' = 'hi',
  'Indonesian' = 'id',
  'Korean' = 'ko',
  'Malay' = 'ms',
  'Vietnamese' = 'vi',
  'Chinese' = 'zh',
  'Japanese' = 'ja',
  'Urdu' = 'ur',
  'Bengali' = 'bn',
  'Russian' = 'ru',
  'Arabic' = 'ar',
}

export const Languages = [
  { name: 'German', value: LanguagesISO639.German, icon: '🇩🇪' },
  { name: 'English', value: LanguagesISO639.English, icon: '🇬🇧' },
  { name: 'French', value: LanguagesISO639.French, icon: '🇫🇷' },
  { name: 'Spanish', value: LanguagesISO639.Spanish, icon: '🇪🇸' },
  { name: 'Italian', value: LanguagesISO639.Italian, icon: '🇮🇹' },
  { name: 'Portuguese', value: LanguagesISO639.Portuguese, icon: '🇵🇹' },
  { name: 'Dutch', value: LanguagesISO639.Dutch, icon: '🇳🇱' },
  { name: 'Swedish', value: LanguagesISO639.Swedish, icon: '🇸🇪' },
  { name: 'Polish', value: LanguagesISO639.Polish, icon: '🇵🇱' },
  { name: 'Romanian', value: LanguagesISO639.Romanian, icon: '🇷🇴' },
  { name: 'Czech', value: LanguagesISO639.Czech, icon: '🇨🇿' },
  { name: 'Danish', value: LanguagesISO639.Danish, icon: '🇩🇰' },
  { name: 'Hungarian', value: LanguagesISO639.Hungarian, icon: '🇭🇺' },
  { name: 'Finnish', value: LanguagesISO639.Finnish, icon: '🇫🇮' },
  { name: 'Slovak', value: LanguagesISO639.Slovak, icon: '🇸🇰' },
  { name: 'Slovenian', value: LanguagesISO639.Slovenian, icon: '🇸🇮' },
  { name: 'Estonian', value: LanguagesISO639.Estonian, icon: '🇪🇪' },
  { name: 'Greek', value: LanguagesISO639.Greek, icon: '🇬🇷' },
  { name: 'Bulgarian', value: LanguagesISO639.Bulgarian, icon: '🇧🇬' },
  { name: 'Croatian', value: LanguagesISO639.Croatian, icon: '🇭🇷' },
  { name: 'Lithuanian', value: LanguagesISO639.Lithuanian, icon: '🇱🇹' },
  { name: 'Latvian', value: LanguagesISO639.Latvian, icon: '🇱🇻' },
  { name: 'Maltese', value: LanguagesISO639.Maltese, icon: '🇲🇹' },
  { name: 'Norwegian', value: LanguagesISO639.Norwegian, icon: '🇳🇴' },
  { name: 'Turkish', value: LanguagesISO639.Turkish, icon: '🇹🇷' },
  { name: 'Ukrainian', value: LanguagesISO639.Ukrainian, icon: '🇺🇦' },
  { name: 'Hebrew', value: LanguagesISO639.Hebrew, icon: '🇮🇱' },
  { name: 'Hindi', value: LanguagesISO639.Hindi, icon: '🇮🇳' },
  { name: 'Indonesian', value: LanguagesISO639.Indonesian, icon: '🇮🇩' },
  { name: 'Korean', value: LanguagesISO639.Korean, icon: '🇰🇷' },
].sort((a, b) => a.name.localeCompare(b.name));

export const getLangName = (langCode: string | undefined | null) => {
  return Languages.find((lang) => lang.value === langCode)?.name ?? '';
};

export const getLangValue = (langName: LanguagesISO639) => {
  return Languages.find((lang) => lang.name === langName)?.value ?? null;
};

export const getLangIcon = (langCode: string | null) => {
  return Languages.find((lang) => lang.value === langCode)?.icon ?? '';
};
export const Levels = [
  { name: 'A1', value: 'A1' },
  { name: 'A2', value: 'A2' },
  { name: 'B1', value: 'B1' },
  { name: 'B2', value: 'B2' },
  { name: 'C1', value: 'C1' },
  { name: 'C2', value: 'C2' },
];

export type PhraseListType = {
  name: string;
  value: PhraseType;
  icon: LucideIcon;
};
export const PhraseTypes = [
  { name: 'Word', value: 'word' as PhraseType, icon: LucideWholeWord, color: 'blue' },
  { name: 'Phrase', value: 'phrase' as PhraseType, icon: Text, color: 'black' },
  { name: 'Recording', value: 'recording' as PhraseType, icon: Ear, color: 'green' },
];

export const getPhraseTypeName = (phraseType: string) => {
  return PhraseTypes.find((type) => type.value === phraseType)?.name ?? '';
};

export const getPhraseTypeValue = (phraseTypeName: string) => {
  return PhraseTypes.find((type) => type.name === phraseTypeName)?.value ?? '';
};

export const getPhraseTypeIcon = (phraseType: string, size?: number) => {
  const type = PhraseTypes.find((type) => type.value === phraseType);
  if (!type) return <></>;
  const icon = <type.icon size={size} color={type.color} />;
  return icon;
};

export type PosType = 'noun' | 'verb' | 'adjective';

export type PosListType = {
  name: string;
  value: string;
  icon: LucideIcon;
  color: string;
};
export const PosTypes = [
  { name: 'Noun', value: 'noun' as PosType, icon: 'N', color: 'blue' },
  { name: 'Verb', value: 'verb' as PosType, icon: 'V', color: 'black' },
  { name: 'Adjective', value: 'adjective' as PosType, icon: 'A', color: 'green' },
];

export const getPosTypeName = (posType: string) => {
  return PosTypes.find((type) => type.value === posType)?.name ?? '';
};

export const getPosTypeValue = (posTypeName: string) => {
  return PosTypes.find((type) => type.name === posTypeName)?.value ?? '';
};

export const getPosTypeIcon = (posType: string, size?: number) => {
  return PosTypes.find((type) => type.value === posType)?.icon ?? '';
};

export const ContentSuggestions = [
  `Computer science and AI`,
  `Adjective verb agreement`,
  `Daily interactions`,
  `Sentences using the word 'Weltschmerz'`,
];

export const TranscriptRequestSuggestions = [
  `Extract all of the nouns`,
  `Generate four more paragraphs like this one`,
  `List all the sentences.`,
];

export type SourceOptionType = 'home' | 'lesson' | 'library' | 'inbox' | 'ai';

export const getContentSuggestions = ({
  contentLang,
  userLanguage,
  prefLanguage,
  suggestionList,
}: {
  contentLang: LanguagesISO639 | null | undefined;
  userLanguage: LanguagesISO639 | null | undefined;
  prefLanguage: LanguagesISO639 | null | undefined;
  suggestionList: string[];
}) => {
  const suggestedTranslationLang = contentLang === userLanguage ? prefLanguage : userLanguage;

  return [
    ...suggestionList,
    userLanguage
      ? `Translate to ${suggestedTranslationLang && getLangName(suggestedTranslationLang)}`
      : `Translate to`,
  ];
};
