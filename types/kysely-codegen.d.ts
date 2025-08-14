// Re-export all types from the generated kysely-codegen db file
// This allows us to import from 'kysely-codegen' as expected

/// <reference path="../node_modules/kysely-codegen/dist/db.d.ts" />

declare module 'kysely-codegen' {
  export {
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
    PhraseType,
  } from '../node_modules/kysely-codegen/dist/db';
}
