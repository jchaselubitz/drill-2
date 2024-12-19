'use server';

import { createClient } from '@/utils/supabase/server';
import db from '../database';
import { BaseTutorTopic, NewTutorTopic } from 'kysely-codegen';
import { revalidatePath } from 'next/cache';

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
  console.log('Adding topic', topic);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const userId = user.id;

  console.log('Adding topic', { userId, topic });

  db.insertInto('tutorTopic')
    .values({
      ...topic,
      userId,
    })
    .execute();
  revalidatePath('/tutor', 'page');
};
