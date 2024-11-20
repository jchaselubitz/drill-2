'use server';

import { revalidatePath } from 'next/cache';
import db from '../database';
import { createClient } from '@/utils/supabase/server';
import { NewMedia, NewUserMedia } from 'kysely-codegen';

export const addUserMedia = async (media: NewMedia) => {
  const { title, description, websiteUrl, mediaUrl, imageUrl } = media;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    return;
  }
  try {
    await db.transaction().execute(async (trx) => {
      const newMedia = await trx
        .insertInto('media')
        .values({
          title,
          description,
          websiteUrl,
          mediaUrl,
          imageUrl,
        } as NewMedia)
        .returning('id')
        .executeTakeFirstOrThrow();

      await trx
        .insertInto('userMedia')
        .values({ profileId: userId, mediaId: newMedia.id } as NewUserMedia)
        .execute();
    });
    revalidatePath('/');
  } catch (error) {
    if (error) {
      throw Error(`Error adding media: ${error}`);
    }
  }
};

export const removeUserMedia = async (mediaId: string) => {
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
      .deleteFrom('userMedia')
      .where('profileId', '=', userId)
      .where('mediaId', '=', mediaId)
      .execute();
    revalidatePath('/');
  } catch (error) {
    if (error) {
      throw Error(`Error removing media: ${error}`);
    }
  }
};
