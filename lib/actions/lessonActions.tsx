'use server';

import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import {
  BasePhrase,
  BaseTranslation,
  Iso639LanguageCode,
  LessonListType,
  LessonWithTranslations,
  NewLesson,
  NewPhrase,
  NewSubject,
  NewTranslation,
  SubjectWithLessons,
  TranslationWithPhrase,
} from 'kysely-codegen';
import { revalidatePath } from 'next/cache';
import { PhraseType } from '@/app/lessons/(components)/lesson_option';
import { createClient } from '@/utils/supabase/server';

import db from '../database';
import { sortLessonTranslation } from '../helpers/helpersTranslation';

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
    .select([
      'subject.id',
      'subject.name',
      'subject.level',
      'subject.createdAt',
      'subject.userId',
      'subject.lang',
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
          ])
          //@ts-ignore
          .whereRef('lesson.subjectId', '=', 'subject.id')
      ).as('lessons'),
    ])
    .where('subject.userId', '=', user.id)
    .execute()) as SubjectWithLessons[];
};

export const createSubject = async ({
  level,
  lang,
}: {
  level: string;
  lang: Iso639LanguageCode;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }
  await db
    .insertInto('subject')
    .values({
      level,
      lang,
      userId: user.id,
    } as NewSubject)
    .executeTakeFirstOrThrow();

  revalidatePath('/lessons', 'page');
};

export const getLessonList = async (): Promise<LessonListType[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  return (await db
    .selectFrom('lesson' as never)
    .select(['id', 'title', 'sideOne', 'sideTwo'])
    .where('userId', '=', user.id)
    .execute()) as LessonListType[];
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
      'lesson.sideOne',
      'lesson.sideTwo',
      'subject.level as level',
      'subject.lang as lang',
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
    translations: lesson.translations.map((translation: BaseTranslation) => ({
      ...translation,
      phraseBase: sortLessonTranslation(translation, lesson).base,
      phraseTarget: sortLessonTranslation(translation, lesson).target,
    })),
  }));

  return lessonWithTranslationsArray;
};

export const createBlankLesson = async ({
  title,
  shortDescription,
  subjectId,
}: {
  title: string;
  shortDescription: string;
  subjectId: string;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }
  try {
    await db
      .insertInto('lesson')
      .values({
        title,
        shortDescription,
        subjectId,
        userId: user.id,
      } as NewLesson)
      .executeTakeFirstOrThrow();
  } catch (error) {
    throw Error('Error creating lesson');
  }

  revalidatePath('/lessons', 'page');
};

export const updateLessonTitle = async ({
  lessonId,
  newTitle,
}: {
  lessonId: string;
  newTitle: string;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }
  try {
    await db
      .updateTable('lesson')
      .set({ title: newTitle })
      .where('id', '=', lessonId)
      .executeTakeFirstOrThrow();
  } catch (error) {
    throw Error('Error updating lesson title');
  }

  revalidatePath(`/lessons/${lessonId}`, 'page');
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

  const baseLang = phrases[0].phrase_primary.lang;
  const subjectLang = phrases[0].phrase_secondary.lang;

  try {
    let newSubjectId = subjectId;
    return await db.transaction().execute(async (trx) => {
      if (!subjectId) {
        const existingSubject = await trx
          .selectFrom('subject')
          .select(['id'])
          .where('name', '=', subjectName)
          .where('level', '=', level)
          .executeTakeFirst();
        if (existingSubject) {
          newSubjectId = existingSubject.id;
        } else {
          const subject = await trx
            .insertInto('subject')
            .values({
              name: subjectName,
              level,
              userId,
              lang: subjectLang,
            } as NewSubject)
            .returning('id')
            .executeTakeFirstOrThrow();
          newSubjectId = subject.id;
        }
      }

      const lesson = await trx
        .insertInto('lesson')
        .values({
          title: `${subjectName} - ${title}`,
          shortDescription: description,
          subjectId: newSubjectId,
          userId,
          sideOne: baseLang,
          sideTwo: subjectLang,
        } as NewLesson)
        .returning('id')
        .executeTakeFirstOrThrow();

      phrases.map(async (phrase) => {
        const phrase1 = await trx
          .insertInto('phrase')
          .values({
            text: phrase.phrase_primary.text,
            lang: phrase.phrase_primary.lang,
            source: 'lesson',
            userId,
          } as NewPhrase)
          .returning('id')
          .executeTakeFirstOrThrow();

        const phrase2 = await trx
          .insertInto('phrase')
          .values({
            text: phrase.phrase_secondary.text,
            lang: phrase.phrase_secondary.lang,
            source: 'lesson',
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

export const addPhrasesToLesson = async ({
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
            .onConflict((oc) => oc.doNothing())
            .returning('id')
            .executeTakeFirst();
          const phrase2 = await trx
            .insertInto('phrase')
            .values({
              text: phrase.phrase_secondary.text,
              lang: phrase.phrase_secondary.lang,
              source: '',
              userId,
            } as NewPhrase)
            .onConflict((oc) => oc.doNothing())
            .returning('id')
            .executeTakeFirst();
          if (phrase1 && phrase2) {
            await trx
              .insertInto('translation')
              .values({
                userId,
                lessonId,
                phrasePrimaryId: phrase1.id,
                phraseSecondaryId: phrase2.id,
              } as NewTranslation)
              .executeTakeFirstOrThrow();
          }
        });
      })
    );
  } catch (error) {
    throw Error('Error adding translations to lesson to db');
  }
  revalidatePath(`/lessons/${lessonId}`, 'page');
};

export const addTranslationToLesson = async ({
  lessonId,
  translationId,
}: {
  lessonId: string;
  translationId: string;
}) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  try {
    await db
      .updateTable('translation')
      .set({ lessonId })
      .where('id', '=', translationId)
      .executeTakeFirstOrThrow();

    revalidatePath(`/lessons/${lessonId}`, 'page');
  } catch (error) {
    throw Error('Error adding translation to lesson to db');
  }
};

export const deleteLesson = async (lessonId: string) => {
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
      // Get all translations for this lesson
      const translations = await trx
        .selectFrom('translation')
        .select(['id', 'phrasePrimaryId', 'phraseSecondaryId'])
        .where('lessonId', '=', lessonId)
        .where('userId', '=', userId)
        .execute();
      const phraseIds = [
        ...new Set(
          translations
            .map((t) => [t.phrasePrimaryId, t.phraseSecondaryId])
            .flat()
            .filter(Boolean)
        ),
      ];
      // Delete translations for this lesson
      await trx
        .deleteFrom('translation')
        .where('lessonId', '=', lessonId)
        .where('userId', '=', userId)
        .execute();
      // Delete phrases (assume phrases are unique to this lesson)
      if (phraseIds.length > 0) {
        await trx
          .deleteFrom('phrase')
          .where('userId', '=', userId)
          .where((eb) => eb('id', 'in', phraseIds))
          .execute();
      }
      // Delete the lesson
      await trx
        .deleteFrom('lesson')
        .where('id', '=', lessonId)
        .where('userId', '=', userId)
        .execute();
    });
  } catch (error) {
    throw Error('Error deleting lesson and associated data');
  }
  revalidatePath('/lessons', 'page');
};

export const deleteLessonOnly = async (lessonId: string) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }
  const userId = user.id;
  try {
    await db.deleteFrom('lesson').where('id', '=', lessonId).where('userId', '=', userId).execute();
  } catch (error) {
    throw Error('Error deleting lesson');
  }
  revalidatePath('/lessons', 'page');
};
