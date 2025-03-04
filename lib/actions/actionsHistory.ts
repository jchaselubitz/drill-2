'use server';

import { createClient } from '@/utils/supabase/server';
import db from '../database';

import { revalidatePath } from 'next/cache';
import { BaseHistory, Iso639LanguageCode } from 'kysely-codegen';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { HistoryVocabType } from '../aiGenerators/types_generation';
import { removeMarkdownNotation } from '../helpers/helpersPhrase';

export async function getUserHistory(): Promise<BaseHistory[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const userId = user.id;

  const histories = (await db
    .selectFrom('history')
    .select(({ eb }) => [
      'id',
      'lang',
      'concepts',
      'insights',
      'createdAt',
      jsonArrayFrom(
        eb
          .selectFrom('phrase')
          .select(['text', 'difficulty', 'partSpeech', 'id'])
          .whereRef('historyId', '=', 'history.id')
      ).as('vocabulary'),
    ])
    .where('userId', '=', userId)
    .orderBy('createdAt', 'desc')
    .execute()) as BaseHistory[];
  return histories;
}

export async function addHistory({
  vocabulary,
  lang,
  insights,
  concepts,
  existingHistory,
}: {
  vocabulary: HistoryVocabType[];
  lang: Iso639LanguageCode;
  insights: string;
  concepts: string[];
  existingHistory: BaseHistory | null | undefined;
}): Promise<{ historyId: string } | undefined> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }
  const userId = user.id;
  if (!userId) {
    throw new Error('No user ID');
  }

  const historyId = existingHistory?.id;
  const existingLang = existingHistory?.lang;
  try {
    if (historyId && existingLang === lang) {
      await db
        .updateTable('history')
        .set({
          insights,
          concepts,
        })
        .where('id', '=', historyId)
        .where('lang', '=', lang)
        .returning('id')
        .executeTakeFirstOrThrow();

      vocabulary.map(async (v) => {
        db.insertInto('phrase')
          .values({
            source: 'history',
            text: removeMarkdownNotation(v.text),
            lang,
            difficulty: v.difficulty,
            userId,
            type: v.isWord ? 'word' : 'phrase',
            partSpeech: v.partSpeech,
            historyId,
          })
          .onConflict((p) =>
            p.constraint('unique_phrase_user_lang').doUpdateSet({
              difficulty: v.difficulty,
              partSpeech: v.partSpeech,
              historyId: historyId,
            })
          )
          .execute();
      });
    } else {
      const history = await db
        .insertInto('history')
        .values({
          userId,
          concepts,
          lang,
          insights,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      vocabulary.map(async (v) => {
        db.insertInto('phrase')
          .values({
            source: 'history',
            text: v.text,
            lang,
            difficulty: v.difficulty,
            userId,
            partSpeech: v.partSpeech,
            historyId: history.id,
          })
          .onConflict((p) =>
            p
              .constraint('unique_phrase_user_lang')
              .doUpdateSet({ difficulty: v.difficulty, partSpeech: v.partSpeech })
          )
          .execute();
      });
    }
  } catch (error) {
    throw new Error(`Error saving history
    : ${error}`);
  }

  revalidatePath('/settings/history', 'page');
}
