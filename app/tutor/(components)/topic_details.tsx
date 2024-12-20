'use client';

import { BaseTutorTopic } from 'kysely-codegen';
import React, { useState } from 'react';

import { useUserContext } from '@/contexts/user_context';
import { generateTutorPrompt } from '@/lib/helpers/helpersAI';
import { LanguagesISO639 } from '@/lib/lists';

import { RefreshCcw } from 'lucide-react';

import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import GrammarCorrection from '@/components/ai_elements/grammar_correction';

interface TopicDetailsProps {
  topic: BaseTutorTopic;
  relevantPhrases: any;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ topic, relevantPhrases }) => {
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const { lang: topicLanguage, level, instructions } = topic;
  const { userLanguage, prefLanguage } = useUserContext();
  const [prompt, setPrompt] = useState<string>(TestPrompt);

  const preparedPhrases = relevantPhrases.map((phrase: any) => phrase.text);

  const handleInitiateLesson = async () => {
    setButtonState('loading');
    if (!userLanguage || !topicLanguage || !level || !instructions) {
      alert('Missing information. Please try again.');
      return;
    }
    try {
      const prompt = await generateTutorPrompt({
        relatedPhraseArray: JSON.stringify(preparedPhrases),
        userLanguage,
        topicLanguage: (topicLanguage as LanguagesISO639) ?? prefLanguage,
        level,
        instructions,
      });
      setPrompt(prompt);
      setButtonState('success');
    } catch (error: any) {
      setButtonState('error');
      throw new Error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col mt-4 gap-3">
      <p>{prompt}</p>
      <LoadingButton
        onClick={handleInitiateLesson}
        className="w-fit"
        buttonState={buttonState}
        text={prompt === '' ? 'Initiate lesson' : <RefreshCcw />}
        loadingText={'Generating ...'}
        successText="Re-submit"
        errorText="Something went wrong"
      />
      <GrammarCorrection />
    </div>
  );
};

export default TopicDetails;

const TestPrompt =
  'Write a short paragraph about the importance of personal conversations in building relationships. Include your thoughts on how they can help us understand each other better.';
