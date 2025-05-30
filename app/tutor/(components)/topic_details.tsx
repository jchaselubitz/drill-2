'use client';

import { BaseCorrection, TutorTopicWithCorrections } from 'kysely-codegen';
import React, { useEffect } from 'react';

import TopicPrompt from './topic_prompt';
import TopicPromptForm from './topic_prompt_form';
import { useTutorContext } from '@/contexts/tutor_context';

interface TopicDetailsProps {
  topic: TutorTopicWithCorrections;
  relevantPhrases: any;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ topic, relevantPhrases }) => {
  const { setSelectedPromptAndCorrection } = useTutorContext();
  const prompts = topic.prompts;

  const lastPrompt = prompts[prompts.length - 1];

  const mostRecentCorrection = prompts
    .flatMap((p) => p.corrections)
    .sort(
      (a: BaseCorrection, b: BaseCorrection) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const promptId = mostRecentCorrection?.tutorPromptId ?? lastPrompt.id;
  const correctionId = mostRecentCorrection?.id;

  useEffect(() => {
    setSelectedPromptAndCorrection({
      promptId: promptId,
      correctionId: correctionId ?? null,
    });
  }, [lastPrompt]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      {prompts.map((prompt, i) => (
        <div key={prompt.id}>
          <TopicPrompt topic={topic} prompt={prompt} relevantPhrases={relevantPhrases} />
        </div>
      ))}

      <TopicPromptForm
        topic={topic}
        relevantPhrases={relevantPhrases}
        promptsLength={prompts.length}
      />
    </div>
  );
};

export default TopicDetails;
