'use server';
import { revalidatePath } from 'next/cache';
import db from '../database';
import { createClient } from '@/utils/supabase/server';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { Iso639LanguageCode, NewPhrase, NewTranslation } from 'kysely-codegen';

export const getPhrases = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return [];
  }

  return await db
    .selectFrom('phrase')
    .select(({ eb }) => [
      'phrase.id',
      'phrase.text',
      'phrase.lang',
      'phrase.createdAt',
      'phrase.partSpeech',
      'phrase.source',
      jsonArrayFrom(
        eb
          .selectFrom('translation')
          .innerJoin('phrase as p1', 'p1.id', 'translation.phraseSecondaryId')
          .select([
            'translation.id',
            'p1.id',
            'p1.text',
            'p1.lang',
            'p1.createdAt',
            'p1.partSpeech',
            'p1.source',
          ])
          .whereRef('phrasePrimaryId', '=', 'phrase.id')
      ).as('translationsWherePrimary'),
      jsonArrayFrom(
        eb
          .selectFrom('translation')
          .innerJoin('phrase as p1', 'p1.id', 'translation.phraseSecondaryId')
          .select([
            'translation.id',
            'p1.id',
            'p1.text',
            'p1.lang',
            'p1.createdAt',
            'p1.partSpeech',
            'p1.source',
          ])
          .whereRef('phraseSecondaryId', '=', 'phrase.id')
      ).as('translationsWhereSecondary'),
    ])
    .where('phrase.userId', '=', userId)
    .execute();
};

export const addPhrase = async ({
  text,
  lang,
  source,
}: {
  text: string;
  lang: Iso639LanguageCode;
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

export type GenResponseType = {
  input_text: string;
  input_lang: string;
  output_text: string;
  output_lang: string;
};
type AddTranslationProps = {
  primaryPhraseIds: string[];
  genResponse: GenResponseType;
  source: string;
};

export const updatePhrase = async ({ phraseId, text }: { phraseId: string; text: string }) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  try {
    await db.updateTable('phrase').set({ text }).where('id', '=', phraseId).execute();
  } catch (error) {
    throw Error(`Failed to update phrase: ${error}`);
  }
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

  if (primaryPhraseIds.length > 0) {
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
