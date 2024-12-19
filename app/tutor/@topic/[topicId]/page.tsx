import React from 'react';
import { getPhrases } from '@/lib/actions/phraseActions';
import { getTutorTopics } from '@/lib/actions/tutorActions';

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
      <h2>Topic Details</h2>
      <p>
        <strong>Language:</strong> {topic.lang}
      </p>
      <p>
        <strong>Level:</strong> {topic.level}
      </p>
      <p>
        <strong>Instructions:</strong> {topic.instructions}
      </p>
      <TopicDetails topic={topic} relevantPhrases={relevantPhrases} />
    </div>
  );
}
