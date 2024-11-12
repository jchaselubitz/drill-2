'use server';

import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import {
  BasePhrase,
  LessonWithTranslations,
  NewLesson,
  NewPhrase,
  NewSubject,
  NewTranslation,
} from 'kysely-codegen';
import { revalidatePath } from 'next/cache';
import { PhraseType } from '@/app/lessons/(components)/lesson_option';
import { createClient } from '@/utils/supabase/server';

import db from '../database';

export const getSubjects = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  return await db
    .selectFrom('subject')
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
          ])
          //@ts-ignore
          .whereRef('lesson.subjectId', '=', 'subject.id')
      ).as('lessons'),
    ])
    .where('subject.userId', '=', user.id)
    .execute();
};

export const getLesson = async (lessonId: string): Promise<LessonWithTranslations | null> => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }
  const lesson = await db
    .selectFrom('lesson')
    .selectAll()
    .where('lesson.id', '=', lessonId)
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
      'lesson.subjectId',
      'lesson.reviewDate',
      'lesson.reviewDeck',
      'subject.level as level',
      jsonArrayFrom(
        eb
          .selectFrom('translation')
          .select(({ eb }) => [
            'translation.id',
            'translation.lessonId',
            'translation.intervalHistory',
            'translation.userId',
            'translation.lessonId',
            'translation.createdAt',
            'translation.repetitionHistory',
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
    ])
    .executeTakeFirstOrThrow();

  const lessonWithTranslations = {
    ...lesson,
    level: lesson.level,
    translations: lesson.translations.map((translation) => ({
      ...translation,
      phrasePrimary: translation.phrasePrimary as BasePhrase,
      phraseSecondary: translation.phraseSecondary as BasePhrase,
    })),
  };

  return lessonWithTranslations;
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
        trx
          .insertInto('translation')
          .values({
            lessonId: lesson.id,
            phrasePrimaryId: phrase1.id,
            phraseSecondaryId: phrase2.id,
            userId,
          } as NewTranslation)
          .execute();
      });
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
    await db.transaction().execute(async (trx) => {
      phrases.map(async (phrase) => {
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

        trx
          .insertInto('translation')
          .values({
            userId,
            lessonId,
            phrasePrimaryId: phrase1.id,
            phraseSecondaryId: phrase2.id,
          } as NewTranslation)
          .execute();
      });
    });
    revalidatePath(`/lessons/${lessonId}`, 'page');
  } catch (error) {
    throw Error('Error adding translations to lesson to db');
  }
};
