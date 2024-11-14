import {
  Kysely,
  PostgresDialect,
  CamelCasePlugin,
  Selectable,
  Insertable,
  Updateable,
} from 'kysely';
import {
  DB,
  Lesson,
  Media,
  Phrase,
  Profile,
  Recording,
  Subject,
  Translation,
  UserMedia,
} from 'kysely-codegen';
import { Pool } from 'pg';
import { LanguagesISO639 } from '../lists';

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
  export interface Episode {
    title: string;
    description: string;
    imageURL: string;
    audioURL: string;
    date: string;
  }

  export type Podcast = {
    title: string;
    description: string;
    imageUrl: string;
    episodes: Episode[];
    website?: string;
    mediaUrl: string;
  };

  export type BaseLesson = Selectable<Lesson> & { level: string | null };
  export type LessonWithTranslations = BaseLesson & {
    translations: TranslationWithPhrase[];
    level: string | null;
  };
  export type NewLesson = Insertable<Lesson>;
  export type EditedLesson = Updateable<Lesson>;

  export type BasePhrase = Selectable<Phrase>;

  export type PhraseWithTranslations = Phrase & {
    translationsWherePrimary: Translation[];
    translationsWhereSecondary: Translation[];
  };
  export type NewPhrase = Insertable<Phrase>;
  export type EditedPhrase = Updateable<Phrase>;

  export type BaseMedia = Selectable<Media>;
  export type NewMedia = Insertable<Media>;
  export type EditedMedia = Updateable<Media>;

  export type NewUserMedia = Insertable<UserMedia>;

  export type BaseProfile = Selectable<Profile>;
  export type ProfileWithMedia = BaseProfile & { media: BaseMedia[] };
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
