import {
  Kysely,
  PostgresDialect,
  CamelCasePlugin,
  Selectable,
  Insertable,
  Updateable,
} from 'kysely';
import {
  Association,
  DB,
  Lesson,
  Media,
  Phrase,
  PhraseTag,
  Profile,
  Subject,
  Tag,
  Translation,
  UserMedia,
  History,
  TutorTopic,
  Correction,
  Iso639LanguageCode,
  TutorPrompt,
  Feedback,
} from 'kysely-codegen';
import { Pool } from 'pg';
import { HistoryVocabType } from '../aiGenerators/types_generation';
import { ReviewUserParagraphSubmissionResponse } from '../aiGenerators/generators_tutor';

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

  export type LessonListType = {
    id: string;
    title: string;
    sideOne: Iso639LanguageCode;
    sideTwo: Iso639LanguageCode;
  };
  export type BaseLesson = Selectable<Lesson> & { level: string | null };
  export type LessonWithTranslations = BaseLesson & {
    translations: TranslationWithPhrase[];
    level: string | null;
    lang: Iso639LanguageCode;
  };
  export type NewLesson = Insertable<Lesson>;
  export type EditedLesson = Updateable<Lesson>;

  export type BaseTag = Selectable<Tag>;
  export type NewTag = Insertable<Tag>;
  export type EditedTag = Updateable<Tag>;

  export type NewPhraseTag = Insertable<PhraseTag>;

  export type BasePhrase = Selectable<Phrase>;
  export type PhraseWithTags = BasePhrase & { tags: BaseTag[] };
  export type PhraseWithTranslations = PhraseWithTags & {
    translations: {
      createdAt: Date;
      id: string;
      userId: string;
      lessonId: string | null;
      lessonTitle: string | null;
      phraseId: string;
    }[];
  };
  export type PhraseWithAssociations = PhraseWithTranslations & {
    associations: {
      createdAt: Date;
      id: string;
      userId: string;
      phraseId: string;
    }[];
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

  export type BaseSubject = Selectable<Subject>;
  export type SubjectWithLessons = BaseSubject & {
    lessons: BaseLesson[];
  };
  export type NewSubject = Insertable<Subject>;
  export type EditedSubject = Updateable<Subject>;

  export type BaseTranslation = Selectable<Translation>;
  export type TranslationWithPhrase =
    | (BaseTranslation & {
        phraseBase: BasePhrase;
        phraseTarget: BasePhrase;
      })
    | null;
  export type NewTranslation = Insertable<Translation>;
  export type EditedTranslation = Updateable<Translation>;

  export type BaseAssociation = Selectable<Association>;
  export type EditedAssociation = Updateable<Association>;
  export type NewAssociation = Insertable<Association>;

  export type BaseHistory = Omit<Selectable<History>, 'vocabulary'> & {
    vocabulary: HistoryVocabType[];
  };

  export type BaseCorrection = Omit<Selectable<Correction>, 'response'> & {
    response: ReviewUserParagraphSubmissionResponse;
  };
  export type NewCorrection = Insertable<Correction>;

  export type BaseTutorPrompt = Selectable<TutorPrompt> & { corrections: BaseCorrection[] };
  export type NewTutorPrompt = Insertable<TutorPrompt>;

  export type BaseTutorTopic = Selectable<TutorTopic>;
  export type TutorTopicWithCorrections = Omit<BaseTutorTopic, 'corrections'> & {
    prompts: BaseTutorPrompt[];
  };
  export type NewTutorTopic = Insertable<TutorTopic>;

  export type BaseFeedback = Selectable<Feedback>;

  export type RevalidationPath = { path: string; type?: 'page' | 'layout' | undefined };
}
export default db;
