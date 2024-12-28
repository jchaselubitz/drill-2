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
import { ReviewUserParagraphSubmissionResponse } from '../helpers/helpersAI';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

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

export const saveTopicPrompt = async ({
  topic,
  prompt,
}: {
  topic: TutorTopicWithCorrections;
  prompt: string;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const userId = user.id;
  const topicId = topic.id;

  await db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom('correction')
      .where(
        'topicId',
        '=',
        topic.corrections.map((c: BaseCorrection) => c.id)
      )
      .execute();
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
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const correction = {
    response: JSON.stringify(response),
    userText,
    userId: user.id,
    topicId,
  } as NewCorrection;

  await db.insertInto('correction').values(correction).returning('id').executeTakeFirstOrThrow();
  revalidatePath('/tutor', 'page');
};
