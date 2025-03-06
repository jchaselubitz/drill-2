// This file is auto-generated. Do not edit manually.
// Generated on 2025-03-06T11:21:27.974Z
// Source: app/experimental/utils/componentDependencies.ts

export const functionDefinitions = [
  {
    symbol: 'addTranslation',
    type: 'function',
    definition:
      '({ primaryPhraseIds, genResponse, source, revalidationPath, phraseType, }: AddTranslationProps) => Promise<never[] | undefined>',
  },
  {
    symbol: 'addPhrase',
    type: 'function',
    definition:
      '({ text, lang, source, filename, type: rawType, associationId, }: { text: string; lang: Iso639LanguageCode; source?: string | undefined; filename?: string | undefined; type: PhraseType; associationId?: string | undefined; }) => Promise<void>',
  },
  {
    symbol: 'getHumanDate',
    type: 'function',
    definition: '(date: Date) => string',
  },
  {
    symbol: 'getLangName',
    type: 'function',
    definition: '(langCode: string | null | undefined) => string',
  },
  {
    symbol: 'getLangValue',
    type: 'function',
    definition: '(langName: string) => LanguagesISO639 | null',
  },
  {
    symbol: 'getLangIcon',
    type: 'function',
    definition: '(langCode: string | null) => string',
  },
  {
    symbol: 'getLessons',
    type: 'function',
    definition: '(lessonId?: string | undefined) => Promise<LessonWithTranslations[]>',
  },
  {
    symbol: 'getSubjects',
    type: 'function',
    definition: '() => Promise<SubjectWithLessons[]>',
  },
  {
    symbol: 'getPhrases',
    type: 'function',
    definition:
      '({ source, pastDays, lang, }: { source?: SourceOptionType | undefined; pastDays?: number | undefined; lang?: Iso639LanguageCode | undefined; }) => Promise<PhraseWithAssociations[]>',
  },
] as const;

export const typeDefinitions = [
  {
    symbol: 'SourceOptionType',
    type: 'type',
    definition: '"home" | "history" | "lesson" | "correction" | "transcript" | "chat"',
  },
  {
    symbol: 'PhraseType',
    type: 'type',
    definition: '"phrase" | "recording" | "word"',
  },
  {
    symbol: 'Iso639LanguageCode',
    type: 'type',
    definition: '"ISO 639 Language Codes"',
  },
  {
    symbol: 'NewAssociation',
    type: 'type',
    definition:
      '{ phrasePrimaryId: string | number | bigint; phraseSecondaryId: string | number | bigint; } & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; }',
  },
  {
    symbol: 'NewPhrase',
    type: 'type',
    definition:
      '{ lang: Iso639LanguageCode; text: string; } & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; difficulty?: number | null | undefined; favorite?: boolean | undefined; filename?: string | null | undefined; historyId?: string | number | bigint | null | undefined; note?: string | null | undefined; partSpeech?: string | null | undefined; source?: string | undefined; type?: "phrase" | "recording" | "word" | undefined; userId?: string | null | undefined; }',
  },
  {
    symbol: 'NewPhraseTag',
    type: 'type',
    definition:
      '{} & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; phraseId?: string | number | bigint | null | undefined; tagId?: string | number | bigint | null | undefined; }',
  },
  {
    symbol: 'NewTag',
    type: 'type',
    definition:
      '{ label: string; } & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; userId?: string | null | undefined; }',
  },
  {
    symbol: 'NewTranslation',
    type: 'type',
    definition:
      '{ phrasePrimaryId: string | number | bigint; phraseSecondaryId: string | number | bigint; userId: string; } & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; lessonId?: string | number | bigint | null | undefined; }',
  },
  {
    symbol: 'AddTranslationProps',
    type: 'type',
    definition:
      '{ primaryPhraseIds?: string[]; genResponse: TranslationResponseType; source: SourceOptionType; revalidationPath?: RevalidationPath; phraseType?: PhraseType; }',
  },
  {
    symbol: 'TranslationResponseType',
    type: 'type',
    definition:
      '{ input_text: string; input_lang: string; output_text: string; output_lang: string; }',
  },
  {
    symbol: 'SubjectWithLessons',
    type: 'type',
    definition:
      '{ createdAt: Date; id: string; lang: Iso639LanguageCode; level: string | null; name: string | null; userId: string | null; } & { lessons: BaseLesson[]; }',
  },
] as const;

export type FunctionDefinition = (typeof functionDefinitions)[number];
export type TypeDefinition = (typeof typeDefinitions)[number];
