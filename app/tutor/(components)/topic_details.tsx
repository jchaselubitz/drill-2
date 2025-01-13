'use client';

import { TutorTopicWithCorrections } from 'kysely-codegen';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useTutorContext } from '@/contexts/tutor_context';

import TopicPrompt from './topic_prompt';
import TopicPromptForm from './topic_prompt_form';

interface TopicDetailsProps {
  topic: TutorTopicWithCorrections;
  relevantPhrases: any;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ topic, relevantPhrases }) => {
  const { selectedPromptAndCorrection } = useTutorContext();
  const prompts = topic.prompts;
  const selectedPrompt = selectedPromptAndCorrection?.promptId;

  return (
    <div className="flex flex-col gap-4 mt-4">
      {prompts.map((prompt) => (
        <div key={prompt.id}>
          <TopicPrompt
            topic={topic}
            prompt={prompt}
            relevantPhrases={relevantPhrases}
            selectedPrompt={selectedPrompt}
          />
        </div>
      ))}
      {prompts && <Separator />}
      <TopicPromptForm topic={topic} relevantPhrases={relevantPhrases} />
    </div>
  );
};

export default TopicDetails;
