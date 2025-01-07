import React from 'react';
import { getPhrases } from '@/lib/actions/phraseActions';
import { getTutorTopics } from '@/lib/actions/tutorActions';
import { getLangName } from '@/lib/lists';

import TopicDetails from '../../(components)/topic_details';
import TopicTopBar from '../../(components)/topic_top_bar';

interface TopicPanelProps {
  params: Promise<{ topicId: string }>;
}

export default async function TopicPanel({ params }: TopicPanelProps) {
  const { topicId } = await params;
  const topics = await getTutorTopics(topicId);
  const topic = topics[0];
  if (!topic) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <h2>Select a topic</h2>
      </div>
    );
  }
  const relevantPhrases = await getPhrases({ source: 'home', pastDays: 30, lang: topic.lang });

  return (
    <div className="relative flex flex-col w-full h-full z-30 bg-white ">
      <TopicTopBar topic={topic} />
      <div className="flex flex-col gap-1 px-4 mt-4 ">
        <strong> {topic.instructions}</strong>
        <div className="text-xs uppercase font-medium text-zinc-500">
          {getLangName(topic.lang)} {topic.level}
        </div>
      </div>
      <div className="px-4 ">
        <TopicDetails topic={topic} relevantPhrases={relevantPhrases} />
      </div>
    </div>
  );
}
