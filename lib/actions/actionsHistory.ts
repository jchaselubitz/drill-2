'use server';

import { createClient } from '@/utils/supabase/server';
import db from '../database';
import { LanguagesISO639 } from '../helpers/lists';
import { revalidatePath } from 'next/cache';
import { BaseHistory } from 'kysely-codegen';

export type HistoryVocabType = { word: string; rank: number };
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
    .selectAll()
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
  vocabulary: { word: string; rank: number }[];
  lang: LanguagesISO639;
  insights: string;
  concepts: string[];
  existingHistory: BaseHistory | null | undefined;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
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
          vocabulary,
          insights,
          concepts,
        })
        .where('id', '=', historyId)
        .where('lang', '=', lang)
        .executeTakeFirstOrThrow();
    } else {
      await db
        .insertInto('history')
        .values({
          userId,
          vocabulary,
          concepts,
          lang,
          insights,
        })
        .execute();
    }
  } catch (error) {
    throw new Error(`Error saving history
    : ${error}`);
  }

  revalidatePath('/settings/history', 'page');
}
