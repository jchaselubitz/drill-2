'use server';

import { revalidatePath } from 'next/cache';
import db from '../database';
import { createClient } from '@/utils/supabase/server';
import { Iso639LanguageCode, NewPhrase, NewRecording } from 'kysely-codegen';

export const addRecordingText = async ({
  transcript,
  filename,
  lang,
}: {
  transcript: string;
  filename: string;
  lang: Iso639LanguageCode;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  try {
    await db
      .insertInto('recording')
      .values({ transcript, lang, filename, userId } as NewRecording)
      .execute();
  } catch (error) {
    if (error) {
      throw error;
    }
  }
  revalidatePath('/');
};
