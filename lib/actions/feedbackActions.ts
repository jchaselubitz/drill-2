'use server';

import { revalidatePath } from 'next/cache';
import db from '../database';

import { headers } from 'next/headers';
import { sendFeedbackNotification } from './notificationActions';
import { createClient } from '@/utils/supabase/server';
import { StorageObject, uploadFile } from './storageActions';

// import { sendFeedbackNotification } from './notificationActions';

export const getFeedback = async () => {
  return await db.selectFrom('feedback').selectAll().orderBy('createdAt', 'desc').execute();
};

type FeedbackFormValues = {
  description: string;
};
export const submitFeedback = async ({
  description,
}: FeedbackFormValues): Promise<string | undefined> => {
  const supabase = createClient();

  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || '';

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const feedback = await db
    .insertInto('feedback')
    .values({
      creator: user.id,
      device: userAgent,
      description,
    })
    .returning('id')
    .executeTakeFirst();

  const headersList = await headers();
  const origin = headersList.get('origin');

  sendFeedbackNotification({
    recipientEmail: 'feedback@cooperativ.io',
    feedback: description,
    device: userAgent,
    origin: `${origin}/feedback`,
    userEmail: user.email || `Anonymous ${user.id}`,
  });

  revalidatePath('/feedback', 'page');
  return feedback?.id;
};

type updateFeedbackVotesProps = {
  feedbackId: string;
  votes: number;
};

export const updateFeedbackVotes = async ({ feedbackId, votes }: updateFeedbackVotesProps) => {
  await db.updateTable('feedback').set({ votes }).where('id', '=', feedbackId).executeTakeFirst();
  revalidatePath('/feedback', 'page');
};

export const toggleResolved = async ({
  feedbackId,
  status,
}: {
  feedbackId: string;
  status: number;
}) => {
  await db.updateTable('feedback').set({ status }).where('id', '=', feedbackId).executeTakeFirst();

  revalidatePath('/feedback', 'page');
};

export async function uploadFeedbackImage({
  file,
  feedbackId,
  fileName,
}: {
  file: FormData;
  feedbackId: string;
  fileName: string;
}) {
  const fileForUpload = file.get('image') as File;
  try {
    const response = await uploadFile({
      bucket: 'feedback-images',
      file: fileForUpload,
      path: `${feedbackId}/${fileName}`,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
  revalidatePath('/feedback', 'page');
}

export async function getFeedbackImages({ feedbackId }: { feedbackId: string }) {
  const supabase = createClient();
  const { data: imageList, error: imageListError } = await supabase.storage
    .from('feedback-images')
    .list(`${feedbackId}`);

  if (imageListError) {
    console.error('Error listing images:', imageListError);
    return [];
  }

  const imagePathList = imageList?.map((image: StorageObject) => {
    return `${feedbackId}/${image.name}`;
  });

  if (imagePathList.length < 1) return [];

  const { data, error } = await supabase.storage
    .from('feedback-images')
    .createSignedUrls(imagePathList, 3600);

  if (error) {
    console.error('Error getting images:', error);
    return [];
  }

  return data;
}
