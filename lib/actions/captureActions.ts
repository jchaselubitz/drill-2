'use server';

import { revalidatePath } from 'next/cache';
import db from '../database';
import { createClient } from '@/utils/supabase/server';

export const addPhrase = async ({ text, lang }: { text: string; lang: string }) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  try {
    await db.insertInto('phrases').values({ text, lang, userId }).execute();
  } catch (error) {
    if (error) {
      throw error;
    }
  }
  revalidatePath('/');
};
