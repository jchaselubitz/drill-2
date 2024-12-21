import React from 'react';
import { getPhrases } from '@/lib/actions/phraseActions';
import { getTutorTopics } from '@/lib/actions/tutorActions';
import { getLangIcon, getLangName } from '@/lib/lists';

import TopicDetails from '../../(components)/topic_details';

interface TopicPanelProps {
  params: Promise<{ topicId: string }>;
}

export default async function TopicPanel({ params }: TopicPanelProps) {
  const { topicId } = await params;
  const topicArray = await getTutorTopics(topicId);
  const topic = topicArray[0];
  const relevantPhrases = await getPhrases({ source: 'home', pastDays: 30, lang: topic.lang });

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-1">
        <strong> {topic.instructions}</strong>
        <div className="text-xs uppercase font-medium text-zinc-500">
          {getLangName(topic.lang)} {topic.level}
        </div>
      </div>

      <TopicDetails topic={topic} relevantPhrases={relevantPhrases} />
    </div>
  );
}
