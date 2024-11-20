'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import db from '../database';
import { LanguagesISO639 } from '../lists';
import { BaseRecording, NewRecording } from 'kysely-codegen';

export const getRecordings = async ({ num }: { num: number }): Promise<BaseRecording[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    return [];
  }

  try {
    return await db
      .selectFrom('recording')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('createdAt', 'desc')
      .limit(num)

      .execute();
  } catch (error) {
    throw Error(`Failed to get recordings: ${error}`);
  }
};

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

export const deleteRecording = async (recordingId: string) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return;
  }

  try {
    await db
      .deleteFrom('recording')
      .where('userId', '=', userId)
      .where('id', '=', recordingId)
      .execute();
  } catch (error) {
    throw Error(`Failed to delete recording: ${error}`);
  }
  revalidatePath('/');
};
