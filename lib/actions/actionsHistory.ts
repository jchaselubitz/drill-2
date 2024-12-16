'use server';

import { createClient } from '@/utils/supabase/server';
import db from '../database';
import { LanguagesISO639 } from '../helpers/lists';
import { revalidatePath } from 'next/cache';

export type HistoryTopicType = 'grammar' | 'vocab' | 'preposition';

export async function getUserHistory() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const userId = user.id;

  const histories = await db
    .selectFrom('history')
    .selectAll()
    .where('userId', '=', userId)
    .orderBy('createdAt', 'desc')
    .execute();
  return histories;
}

export async function addHistory({
  topic,
  lang,
  insight,
}: {
  topic: HistoryTopicType;
  lang: LanguagesISO639;
  insight: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const userId = user.id;
  await db
    .insertInto('history')
    .values({
      userId,
      topic,
      lang,
      insight,
    })
    .execute();

  revalidatePath('/settings/history', 'page');
}
