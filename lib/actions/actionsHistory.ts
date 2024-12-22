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
  historyId,
}: {
  vocabulary: { word: string; rank: number }[];
  lang: LanguagesISO639;
  insights: string;
  concepts: string[];
  historyId?: string;
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
  if (historyId) {
    await db
      .updateTable('history')
      .set({
        vocabulary,
        insights,
        concepts,
      })
      .where('id', '=', historyId)
      .execute();
    revalidatePath('/settings/history', 'page');
    return;
  }
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

  revalidatePath('/settings/history', 'page');
}
