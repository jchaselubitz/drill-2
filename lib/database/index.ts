import {
  Kysely,
  PostgresDialect,
  CamelCasePlugin,
  Selectable,
  Insertable,
  Updateable,
} from 'kysely';
import { DB, Lesson, Phrase, Profile, Recording, Subject, Translation } from 'kysely-codegen';
import { Pool } from 'pg';

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

const db = new Kysely<DB>({
  plugins: [new CamelCasePlugin()],
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    }),
  }),
});

declare module 'kysely-codegen' {
  export type BaseLesson = Selectable<Lesson> & { level: string | null };
  export type LessonWithTranslations = BaseLesson & {
    translations: TranslationWithPhrase[];
    level: string | null;
  };
  export type NewLesson = Insertable<Lesson>;
  export type EditedLesson = Updateable<Lesson>;

  export type BasePhrase = Selectable<Phrase>;
  export type BasePhraseObject = {
    createdAt: Date | null;
    id: string;
    userId: string | null;
    lang: string | null;
    partSpeech: string | null;
    source: string | null;
    text: string | null;
  };
  export type PhraseWithTranslations = Phrase & {
    translationsWherePrimary: Translation[];
    translationsWhereSecondary: Translation[];
  };
  export type NewPhrase = Insertable<Phrase>;
  export type EditedPhrase = Updateable<Phrase>;

  export type BaseProfile = Selectable<Profile>;
  export type NewProfile = Insertable<Profile>;
  export type EditedProfile = Updateable<Profile>;

  export type BaseRecording = Selectable<Recording>;
  export type NewRecording = Insertable<Recording>;
  export type EditedRecording = Updateable<Recording>;

  export type BaseSubject = Selectable<Subject>;
  export type SubjectWithLessons = BaseSubject & {
    lessons: BaseLesson[];
    lang: LanguagesISO639;
  };
  export type NewSubject = Insertable<Subject>;
  export type EditedSubject = Updateable<Subject>;

  export type BaseTranslation = Selectable<Translation>;
  export type TranslationWithPhrase =
    | (BaseTranslation & {
        phrasePrimary: BasePhrase;
        phraseSecondary: BasePhrase;
      })
    | null;
  export type NewTranslation = Insertable<Translation>;
  export type EditedTranslation = Updateable<Translation>;
}

export default db;
