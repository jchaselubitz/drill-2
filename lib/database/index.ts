

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
 Phrase,
 Profile,
 Recording,
 Subject,
 Translation,

} from 'kysely-codegen';
import { Pool } from 'pg';

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

  export type BaseLesson = Selectable<Lesson>;
  export type NewLesson = Insertable<Lesson>;
  export type EditedLesson = Updateable<Lesson>;

  export type BasePhrase = Selectable<Phrase>;
  export type NewPhrase = Insertable<Phrase>;
  export type EditedPhrase = Updateable<Phrase>;

  export type BaseProfile = Selectable<Profile>;
  export type NewProfile = Insertable<Profile>;
  export type EditedProfile = Updateable<Profile>;

  export type BaseRecording = Selectable<Recording>;
  export type NewRecording = Insertable<Recording>;
  export type EditedRecording = Updateable<Recording>;

  export type BaseSubject = Selectable<Subject>;
  export type NewSubject = Insertable<Subject>;
  export type EditedSubject = Updateable<Subject>;

  export type BaseTranslation = Selectable<Translation>;
  export type NewTranslation = Insertable<Translation>;
  export type EditedTranslation = Updateable<Translation>;

}

export default db;