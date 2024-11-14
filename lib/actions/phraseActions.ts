'use server';
import { revalidatePath } from 'next/cache';
import db from '../database';
import { createClient } from '@/utils/supabase/server';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import {
  BaseTag,
  NewPhrase,
  NewPhraseTag,
  NewTag,
  NewTranslation,
  Phrase,
  PhraseWithTranslations,
} from 'kysely-codegen';
import { LanguagesISO639, SourceOptionType } from '../lists';

export const getPhrases = async (source?: SourceOptionType): Promise<PhraseWithTranslations[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return [];
  }

  let phrases = db
    .selectFrom('phrase')
    .select(({ eb }) => [
      'phrase.id',
      'phrase.text',
      'phrase.lang',
      'phrase.createdAt',
      'phrase.partSpeech',
      'phrase.source',
      'phrase.userId',
      jsonArrayFrom(
        eb
          .selectFrom('tag')
          .innerJoin('phraseTag', 'phraseTag.tagId', 'tag.id')
          .select(['tag.id', 'tag.label', 'tag.userId', 'tag.createdAt'])
          .where('tag.userId', '=', userId)
      ).as('tags'),
      jsonArrayFrom(
        eb
          .selectFrom('translation')
          .innerJoin('phrase as p1', 'p1.id', 'translation.phraseSecondaryId')
          .select([
            'translation.id',
            'translation.lessonId as lessonId',
            'p1.id as phraseId',
            'p1.text',
            'p1.lang',
            'p1.createdAt',
            'p1.partSpeech',
            'p1.source',
            'p1.userId',
          ])
          .whereRef('phrasePrimaryId', '=', 'phrase.id')
      ).as('translationsWherePrimary'),
      jsonArrayFrom(
        eb
          .selectFrom('translation')
          .innerJoin('phrase as p1', 'p1.id', 'translation.phraseSecondaryId')
          .select([
            'translation.id',
            'translation.lessonId as lessonId',
            'p1.id as phraseId',
            'p1.text',
            'p1.lang',
            'p1.createdAt',
            'p1.partSpeech',
            'p1.source',
            'p1.userId',
          ])
          .whereRef('phraseSecondaryId', '=', 'phrase.id')
      ).as('translationsWhereSecondary'),
    ])
    .where('phrase.userId', '=', userId)
    .orderBy('phrase.createdAt', 'desc');

  if (source) {
    phrases = phrases.where('phrase.source', '=', source);
  }

  const phrasesWithTranslations = await phrases.execute();

  return phrasesWithTranslations as PhraseWithTranslations[];
};

export const addPhrase = async ({
  text,
  lang,
  source,
}: {
  text: string;
  lang: LanguagesISO639;
  source?: string;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  try {
    await db
      .insertInto('phrase')
      .values({ text, lang, userId, source } as NewPhrase)
      .execute();
  } catch (error) {
    if (error) {
      throw error;
    }
  }
  revalidatePath('/');
};

export const addPhraseTag = async ({ phraseId, tag }: { phraseId: string; tag: BaseTag }) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    return [];
  }
  try {
    await db.transaction().execute(async (trx) => {
      if (!tag.id) {
        const newTag = await trx
          .insertInto('tag')
          .values({ label: tag.label, userId: tag.userId })
          .returning('id')
          .executeTakeFirstOrThrow();
        await trx
          .insertInto('phraseTag')
          .values({ phraseId, tagId: newTag.id, userId } as NewPhraseTag)
          .execute();
      }
      await trx
        .insertInto('phraseTag')
        .values({ phraseId, tagId: tag.id, userId } as NewPhraseTag)
        .execute();
    });
  } catch (error) {
    throw Error(`Failed to add tags to phrase: ${error}`);
  }
};

export const removePhraseTag = async ({
  phraseId,
  tagId,
}: {
  phraseId: string;
  tagId: string[];
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    return [];
  }
  //theoretically one user could delete anther user's tags, but I am not going to worry about that for now
  try {
    await db.transaction().execute(async (trx) => {
      await trx
        .deleteFrom('phraseTag')
        .where('phraseId', '=', phraseId)
        .where('tagId', '=', tagId)
        .execute();
    });
  } catch (error) {
    throw Error(`Failed to remove tags from phrase: ${error}`);
  }
};

export const updatePhrase = async ({ phraseId, text }: { phraseId: string; text: string }) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    return [];
  }
  try {
    await db
      .updateTable('phrase')
      .set({ text })
      .where('id', '=', phraseId)
      .where('userId', '=', userId)
      .execute();
  } catch (error) {
    throw Error(`Failed to update phrase: ${error}`);
  }
};

export type GenResponseType = {
  input_text: string;
  input_lang: string;
  output_text: string;
  output_lang: string;
};

type AddTranslationProps = {
  primaryPhraseIds?: string[];
  genResponse: GenResponseType;
  source: string;
};

export const addTranslation = async ({
  primaryPhraseIds,
  genResponse,
  source,
}: AddTranslationProps) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return [];
  }

  if (primaryPhraseIds && primaryPhraseIds.length > 0) {
    const primaryPhraseId = primaryPhraseIds[0];
    const translation = await db.transaction().execute(async (trx) => {
      const secondaryPhrase = await trx
        .insertInto('phrase')
        .values({
          text: genResponse.output_text,
          lang: genResponse.output_lang,
          userId,
          source,
        } as NewPhrase)
        .returning('id')
        .executeTakeFirstOrThrow();

      return await trx
        .insertInto('translation')
        .values({
          phrasePrimaryId: primaryPhraseId,
          phraseSecondaryId: secondaryPhrase.id,
          userId,
        } as NewTranslation)
        .returning('id')
        .executeTakeFirstOrThrow();
    });
    return translation.id;
  } else {
    const translation = await db.transaction().execute(async (trx) => {
      const primaryPhrase = await trx
        .insertInto('phrase')
        .values({
          text: genResponse.input_text,
          lang: genResponse.input_lang,
          userId,
          source,
        } as NewPhrase)
        .returning('id')
        .executeTakeFirstOrThrow();
      const secondaryPhrase = await trx
        .insertInto('phrase')
        .values({
          text: genResponse.output_text,
          lang: genResponse.output_lang,
          userId,
          source,
        } as NewPhrase)
        .returning('id')
        .executeTakeFirstOrThrow();
      return await trx
        .insertInto('translation')
        .values({
          phrasePrimaryId: primaryPhrase.id,
          phraseSecondaryId: secondaryPhrase.id,
          userId,
        } as NewTranslation)
        .returning('id')
        .executeTakeFirstOrThrow();
    });
    return translation.id;
  }
};
