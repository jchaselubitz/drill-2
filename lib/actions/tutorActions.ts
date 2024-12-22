'use server';

import { createClient } from '@/utils/supabase/server';
import db from '../database';
import { BaseTutorTopic, NewTutorTopic } from 'kysely-codegen';
import { revalidatePath } from 'next/cache';
import { ReviewUserParagraphSubmissionResponse } from '../helpers/helpersAI';

export const getTutorTopics = async (topicId?: string): Promise<BaseTutorTopic[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const userId = user.id;

  const topics = db.selectFrom('tutorTopic').selectAll().where('userId', '=', userId);
  if (topicId) {
    topics.where('id', '=', topicId);
  }

  const resp = (await topics.execute()) as BaseTutorTopic[];
  return resp;
};

export const addTutorTopic = async (topic: NewTutorTopic) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const userId = user.id;

  db.insertInto('tutorTopic')
    .values({
      ...topic,
      userId,
    })
    .execute();
  revalidatePath('/tutor', 'page');
};

export const deleteTutorTopic = async (topicId: string) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const userId = user.id;

  db.deleteFrom('tutorTopic').where('userId', '=', userId).where('id', '=', topicId).execute();
  revalidatePath('/tutor', 'page');
};

export const saveTopicPrompt = async ({ topicId, prompt }: { topicId: string; prompt: string }) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const userId = user.id;

  await db
    .updateTable('tutorTopic')
    .set({ prompt, response: null })
    .where('userId', '=', userId)
    .where('id', '=', topicId)
    .execute();
  revalidatePath('/tutor', 'page');
};

export const saveTopicResponse = async ({
  response,
  topicId,
}: {
  response: ReviewUserParagraphSubmissionResponse | undefined | null;
  topicId: string;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const userId = user.id;
  await db
    .updateTable('tutorTopic')
    .set('response', response ?? null)
    .where('userId', '=', userId)
    .where('id', '=', topicId)
    .execute();
  revalidatePath('/tutor', 'page');
};
