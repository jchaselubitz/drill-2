'use server';

import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import {
  BaseLesson,
  BasePhrase,
  LessonWithTranslations,
  NewLesson,
  NewPhrase,
  NewSubject,
  NewTranslation,
  SubjectWithLessons,
} from 'kysely-codegen';
import { revalidatePath } from 'next/cache';
import { PhraseType } from '@/app/lessons/(components)/lesson_option';
import { createClient } from '@/utils/supabase/server';

import db from '../database';
import { LanguagesISO639 } from '../lists';

export const getSubjects = async (): Promise<SubjectWithLessons[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  return (await db
    .selectFrom('subject' as never)
    .innerJoin('lesson', 'subject.id', 'lesson.subjectId')
    .limit(1)
    .innerJoin('translation', 'lesson.id', 'translation.lessonId')
    .innerJoin('phrase', 'translation.phraseSecondaryId', 'phrase.id')
    .select([
      'subject.id',
      'subject.name',
      'subject.level',
      'subject.createdAt',
      'subject.userId',
      'phrase.lang as lang',
      jsonArrayFrom(
        db
          .selectFrom('lesson')
          .select([
            'lesson.id',
            'lesson.title',
            'lesson.shortDescription',
            'lesson.content',
            'lesson.recordingUrl',
            'lesson.createdAt',
            'lesson.reviewDate',
            'lesson.reviewDeck',
            'lesson.subjectId',
            // 'subject.level as level',
          ])
          //@ts-ignore
          .whereRef('lesson.subjectId', '=', 'subject.id')
      ).as('lessons'),
    ])
    .where('subject.userId', '=', user.id)
    .execute()) as SubjectWithLessons[];
};

export const getLessons = async (lessonId?: string): Promise<LessonWithTranslations[]> => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }
  let lessons = db
    .selectFrom('lesson' as never)
    .selectAll()

    .where('lesson.userId', '=', user.id)
    .leftJoin('subject', 'lesson.subjectId', 'subject.id')
    .select(({ eb }) => [
      'lesson.id',
      'lesson.title',
      'lesson.shortDescription',
      'lesson.subjectId',
      'lesson.userId',
      'lesson.content',
      'lesson.createdAt',
      'lesson.recordingUrl',
      'lesson.reviewDate',
      'lesson.reviewDeck',
      'subject.level as level',
      'subject.name as subjectName',

      jsonArrayFrom(
        eb
          .selectFrom('translation')
          .select(({ eb }) => [
            'translation.id',
            'translation.lessonId',
            'translation.userId',
            'translation.lessonId',
            'translation.createdAt',
            'translation.phrasePrimaryId',
            'translation.phraseSecondaryId',
            jsonObjectFrom(
              eb
                .selectFrom('phrase as p1')
                .select(['createdAt', 'id', 'userId', 'lang', 'partSpeech', 'source', 'text'])

                .whereRef('p1.id', '=', 'translation.phrasePrimaryId')
            ).as('phrasePrimary'),
            jsonObjectFrom(
              eb
                .selectFrom('phrase as p2')
                .select(['createdAt', 'id', 'userId', 'lang', 'partSpeech', 'source', 'text'])
                .whereRef('p2.id', '=', 'translation.phraseSecondaryId')
            ).as('phraseSecondary'),
          ])
          .whereRef('translation.lessonId', '=', 'lesson.id')
      ).as('translations'),
    ]);

  if (lessonId) {
    lessons = lessons.where('lesson.id', '=', lessonId);
  }

  const response = await lessons.execute();

  const lessonWithTranslationsArray = response.map((lesson) => ({
    ...lesson,
    level: lesson.level,
    lang: (lesson.translations[0].phrasePrimary?.lang as LanguagesISO639) ?? null,
    translations: lesson.translations.map((translation) => ({
      ...translation,
      phrasePrimary: translation.phrasePrimary as BasePhrase,
      phraseSecondary: translation.phraseSecondary as BasePhrase,
    })),
  }));

  return lessonWithTranslationsArray;
};

export const addSubjectLessonWithTranslations = async ({
  title,
  description,
  level,
  phrases,
  subjectId,
  subjectName,
}: {
  title: string;
  description: string;
  level: string;
  phrases: PhraseType[];
  subjectId?: string | undefined;
  subjectName: string;
}) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }
  const userId = user.id;
  try {
    let newSubjectId = subjectId;
    return await db.transaction().execute(async (trx) => {
      if (!subjectId) {
        const subject = await trx
          .insertInto('subject')
          .values({
            name: subjectName,
            level,
            userId,
          } as NewSubject)
          .returning('id')
          .executeTakeFirstOrThrow();
        newSubjectId = subject.id;
      }

      const lesson = await trx
        .insertInto('lesson')
        .values({
          title,
          shortDescription: description,
          subjectId: newSubjectId,
          userId,
        } as NewLesson)
        .returning('id')
        .executeTakeFirstOrThrow();

      phrases.map(async (phrase) => {
        const phrase1 = await trx
          .insertInto('phrase')
          .values({
            text: phrase.phrase_primary.text,
            lang: phrase.phrase_primary.lang,
            source: title,
            userId,
          } as NewPhrase)
          .returning('id')
          .executeTakeFirstOrThrow();

        const phrase2 = await trx
          .insertInto('phrase')
          .values({
            text: phrase.phrase_secondary.text,
            lang: phrase.phrase_secondary.lang,
            source: title,
            userId,
          } as NewPhrase)
          .returning('id')
          .executeTakeFirstOrThrow();
        await trx
          .insertInto('translation')
          .values({
            lessonId: lesson.id,
            phrasePrimaryId: phrase1.id,
            phraseSecondaryId: phrase2.id,
            userId,
          } as NewTranslation)
          .executeTakeFirstOrThrow();
      });
      revalidatePath('/lessons', 'page');
      return { subjectId: newSubjectId, lessonId: lesson.id };
    });
  } catch (error) {
    throw Error('Error saving lesson to db:');
  }
};

export const addTranslationsToLesson = async ({
  lessonId,
  phrases,
}: {
  lessonId: string;
  phrases: PhraseType[];
}) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }
  const userId = user.id;
  try {
    await Promise.all(
      phrases.map(async (phrase) => {
        await db.transaction().execute(async (trx) => {
          const phrase1 = await trx
            .insertInto('phrase')
            .values({
              text: phrase.phrase_primary.text,
              lang: phrase.phrase_primary.lang,
              source: '',
              userId,
            } as NewPhrase)
            .returning('id')
            .executeTakeFirstOrThrow();
          const phrase2 = await trx
            .insertInto('phrase')
            .values({
              text: phrase.phrase_secondary.text,
              lang: phrase.phrase_secondary.lang,
              source: '',
              userId,
            } as NewPhrase)
            .returning('id')
            .executeTakeFirstOrThrow();

          await trx
            .insertInto('translation')
            .values({
              userId,
              lessonId,
              phrasePrimaryId: phrase1.id,
              phraseSecondaryId: phrase2.id,
            } as NewTranslation)
            .executeTakeFirstOrThrow();
        });
      })
    );
    revalidatePath(`/lessons/${lessonId}`, 'page');
  } catch (error) {
    throw Error('Error adding translations to lesson to db');
  }
};
