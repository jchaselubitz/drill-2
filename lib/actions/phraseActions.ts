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
  PhraseType,
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
      'phrase.favorite',
      'phrase.type',
      'phrase.filename',
      jsonArrayFrom(
        eb
          .selectFrom('tag')

          .innerJoin('phraseTag', 'phraseTag.tagId', 'tag.id')
          .where('tag.userId', '=', userId)
          .whereRef('phraseId', '=', 'phrase.id')
          .select(['tag.id', 'tag.label', 'tag.userId', 'tag.createdAt'])
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
  filename,
  type,
}: {
  text: string;
  lang: LanguagesISO639;
  source?: string;
  filename?: string;
  type: PhraseType;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  try {
    await db
      .insertInto('phrase')
      .values({ text, lang, userId, source, type, filename } as NewPhrase)
      .execute();
  } catch (error) {
    if (error) {
      throw error;
    }
  }
  revalidatePath('/');
};

export const addPhraseTags = async ({ phraseId, tags }: { phraseId: string; tags: string[] }) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId || tags.length === 0) return;

  try {
    await Promise.all(
      tags.map(async (tagText: string) => {
        await db.transaction().execute(async (trx) => {
          const tag = await trx
            .selectFrom('tag')
            .select(['id'])
            .where('label', '=', tagText)
            .where('userId', '=', userId)
            .executeTakeFirst();

          if (tag?.id) {
            await trx
              .insertInto('phraseTag')
              .values({ phraseId, tagId: tag.id } as NewPhraseTag)
              .execute();
          } else {
            const newTag = await trx
              .insertInto('tag')
              .values({ label: tagText, userId } as NewTag)
              .returning('id')
              .executeTakeFirstOrThrow();

            await trx
              .insertInto('phraseTag')
              .values({ phraseId, tagId: newTag.id } as NewPhraseTag)
              .execute();
          }
        });
      })
    );
  } catch (error) {
    throw new Error(`Failed to add tags to phrase: ${error}`);
  }

  revalidatePath('/library', 'page');
};

export const removePhraseTag = async ({ phraseId, tagId }: { phraseId: string; tagId: string }) => {
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
  revalidatePath('/library', 'page');
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

export const togglePhraseFavorite = async ({
  phraseId,
  isFavorite,
}: {
  phraseId: string;
  isFavorite: boolean;
}) => {
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
      .set({ favorite: !isFavorite })
      .where('id', '=', phraseId)
      .where('userId', '=', userId)
      .execute();
    revalidatePath('/library');
  } catch (error) {
    throw Error(`Failed to toggle favorite: ${error}`);
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

export const deletePhrase = async (phraseId: string) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return;
  }

  try {
    const deletedPhrase = await db
      .deleteFrom('phrase')
      .where('id', '=', phraseId)
      .where('userId', '=', userId)
      .returning('filename')
      .execute();
    if (deletedPhrase.length > 0) {
      const filename = deletedPhrase[0].filename;
      if (filename) {
        await supabase.storage.from('user_recordings').remove([`${userId}/${filename}`]);
      }
    }
  } catch (error) {
    throw Error(`Failed to delete phrase: ${error}`);
  }
  revalidatePath('/library');
};
