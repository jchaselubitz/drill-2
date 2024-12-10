'use server';
import { revalidatePath } from 'next/cache';
import db, { RevalidationPath } from '../database';
import { createClient } from '@/utils/supabase/server';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import {
  BaseTag,
  NewAssociation,
  NewPhrase,
  NewPhraseTag,
  NewTag,
  NewTranslation,
  Phrase,
  PhraseType,
  PhraseWithAssociations,
} from 'kysely-codegen';
import { LanguagesISO639, SourceOptionType } from '../lists';

export const getPhrases = async (source?: SourceOptionType): Promise<PhraseWithAssociations[]> => {
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
          .where(({ or, eb }) =>
            or([
              eb('phrase.id', '=', eb.ref('phrasePrimaryId')),
              eb('phrase.id', '=', eb.ref('phraseSecondaryId')),
            ])
          )
          .leftJoin('phrase as p1', 'p1.id', 'translation.phrasePrimaryId')
          .leftJoin('phrase as p2', 'p2.id', 'translation.phraseSecondaryId')
          .select([
            'translation.id',
            'translation.lessonId as lessonId',
            'p1.id as p1_Id',
            'p1.text as p1_text',
            'p1.lang as p1_lang',
            'p1.createdAt as p1_createdAt',
            'p1.partSpeech as p1_partSpeech',
            'p1.source as p1_source',
            'p1.userId as p1_userId',
            'p2.id as p2_Id',
            'p2.text as p2_text',
            'p2.lang as p2_lang',
            'p2.createdAt as p2_createdAt',
            'p2.partSpeech as p2_partSpeech',
            'p2.source as p2_source',
            'p2.userId as p2_userId',
          ])
      ).as('rawTranslations'),
      jsonArrayFrom(
        eb
          .selectFrom('association')
          .where(({ or, eb }) =>
            or([
              eb('phrase.id', '=', eb.ref('phrasePrimaryId')),
              eb('phrase.id', '=', eb.ref('phraseSecondaryId')),
            ])
          )
          .leftJoin('phrase as p1', 'p1.id', 'association.phrasePrimaryId')
          .leftJoin('phrase as p2', 'p2.id', 'association.phraseSecondaryId')
          .select([
            'association.id',
            'p1.id as p1_Id',
            'p1.text as p1_text',
            'p1.lang as p1_lang',
            'p1.createdAt as p1_createdAt',
            'p1.partSpeech as p1_partSpeech',
            'p1.source as p1_source',
            'p1.userId as p1_userId',
            'p2.id as p2_Id',
            'p2.text as p2_text',
            'p2.lang as p2_lang',
            'p2.createdAt as p2_createdAt',
            'p2.partSpeech as p2_partSpeech',
            'p2.source as p2_source',
            'p2.userId as p2_userId',
          ])
      ).as('rawAssociations'),
    ])
    .where('phrase.userId', '=', userId)
    .orderBy('phrase.createdAt', 'desc');

  if (source) {
    phrases = phrases.where('phrase.source', '=', source);
  }

  const phrasesWithAssociations = await phrases.execute();

  const preparedPhrases = phrasesWithAssociations.map((phrase) => {
    const polishRelationships = (phraseId: string, phrasesWithRelationships: any) => {
      return phrasesWithRelationships.map((relationship: any) => {
        let phrases = [];
        if (relationship.p1Id.toString() !== phraseId) {
          phrases.push({
            id: relationship.p1Id,
            text: relationship.p1Text,
            lang: relationship.p1Lang,
            createdAt: relationship.p1CreatedAt,
            partSpeech: relationship.p1PartSpeech,
            source: relationship.p1Source,
            userId: relationship.p1UserId,
          });
        }
        if (relationship.p2Id.toString() !== phraseId) {
          phrases.push({
            id: relationship.p2Id,
            text: relationship.p2Text,
            lang: relationship.p2Lang,
            createdAt: relationship.p2CreatedAt,
            partSpeech: relationship.p2PartSpeech,
            source: relationship.p2Source,
            userId: relationship.p2UserId,
          });
        }
        return {
          id: relationship.id,
          lessonId: relationship.lessonId,
          phrases,
        };
      });
    };
    return {
      ...phrase,
      translations: polishRelationships(phrase.id, phrase.rawTranslations),
      associations: polishRelationships(phrase.id, phrase.rawAssociations),
    };
  });

  return preparedPhrases as PhraseWithAssociations[];
};

export const addPhrase = async ({
  text,
  lang,
  source,
  filename,
  type,
  associationId,
}: {
  text: string;
  lang: LanguagesISO639;
  source?: string;
  filename?: string;
  type: PhraseType;
  associationId?: string;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  try {
    await db.transaction().execute(async (trx) => {
      const newPhrase = await trx
        .insertInto('phrase')
        .values({ text, lang, userId, source, type, filename } as NewPhrase)
        .returning('id')
        .executeTakeFirstOrThrow();

      if (associationId) {
        await trx
          .insertInto('association')
          .values({
            phrasePrimaryId: associationId,
            phraseSecondaryId: newPhrase.id,
          } as NewAssociation)
          .executeTakeFirstOrThrow();
      }
    });
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
  revalidationPath?: RevalidationPath;
};

export const addTranslation = async ({
  primaryPhraseIds,
  genResponse,
  source,
  revalidationPath,
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
    await db.transaction().execute(async (trx) => {
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
  } else {
    await db.transaction().execute(async (trx) => {
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
  }
  revalidationPath
    ? revalidatePath(revalidationPath.path, revalidationPath.type)
    : revalidatePath('/library', 'page');
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
  revalidatePath('/library', 'page');
};
