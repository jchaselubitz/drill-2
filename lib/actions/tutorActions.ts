'use server';

import { createClient } from '@/utils/supabase/server';
import db from '../database';
import {
  BaseCorrection,
  NewCorrection,
  NewTutorTopic,
  TutorTopicWithCorrections,
} from 'kysely-codegen';
import { revalidatePath } from 'next/cache';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { ReviewUserParagraphSubmissionResponse } from '../aiGenerators/generators_tutor';

export const getTutorTopics = async (topicId?: string): Promise<TutorTopicWithCorrections[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const userId = user.id;

  let topicPackage = db
    .selectFrom('tutorTopic as t')
    .select(({ eb }) => [
      'id',
      'createdAt',
      'instructions',
      'lang',
      'messages',
      'prompt',
      'level',
      'userId',
      jsonArrayFrom(
        eb
          .selectFrom('correction')
          .select(['id', 'createdAt', 'response', 'userText', 'userId', 'topicId'])
          .whereRef('topicId', '=', 't.id')
          .orderBy('createdAt', 'desc')
      ).as('corrections'),
    ])
    .where('userId', '=', userId);

  if (topicId) {
    topicPackage = topicPackage.where('id', '=', topicId);
  }

  const topics = await topicPackage.execute();

  const topicsObject = topics.map((topic: any) => {
    return {
      ...topic,
      corrections: topic.corrections as BaseCorrection[],
    };
  });

  return topicsObject as TutorTopicWithCorrections[];
};

export const addTutorTopic = async (topic: NewTutorTopic): Promise<string | undefined> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const userId = user.id;

  const newTopic = await db
    .insertInto('tutorTopic')
    .values({
      ...topic,
      userId,
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  revalidatePath('/tutor', 'page');
  return newTopic.id;
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

  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom('correction').where('topicId', '=', topicId).execute();
    await db
      .updateTable('tutorTopic')
      .set({ prompt })
      .where('userId', '=', userId)
      .where('id', '=', topicId)
      .execute();
  });
  revalidatePath('/tutor', 'page');
};

export const saveTopicResponse = async ({
  response,
  userText,
  topicId,
}: {
  response: ReviewUserParagraphSubmissionResponse;
  userText: string;
  topicId: string;
}): Promise<string> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return '';
  }

  const correction = {
    response: JSON.stringify(response),
    userText,
    userId: user.id,
    topicId,
  } as NewCorrection;

  const cor = await db
    .insertInto('correction')
    .values(correction)
    .returning('id')
    .executeTakeFirstOrThrow();
  revalidatePath('/tutor', 'page');
  return cor.id;
};
