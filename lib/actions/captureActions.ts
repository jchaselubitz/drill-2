'use server';

import { revalidatePath } from 'next/cache';
import db from '../database';
import { createClient } from '@/utils/supabase/server';
import { NewRecording } from 'kysely-codegen';
import { LanguagesISO639 } from '../lists';

export const addRecordingText = async ({
  transcript,
  filename,
  lang,
}: {
  transcript: string;
  filename: string;
  lang: LanguagesISO639;
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
