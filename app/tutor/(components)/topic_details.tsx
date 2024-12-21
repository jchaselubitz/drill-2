'use client';

import { BaseTutorTopic } from 'kysely-codegen';
import { RefreshCcw, RefreshCw, Stars } from 'lucide-react';
import React, { useState } from 'react';
import GrammarCorrection from '@/components/ai_elements/grammar_correction';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { useUserContext } from '@/contexts/user_context';
import { saveTopicPrompt } from '@/lib/actions/tutorActions';
import { generateTutorPrompt } from '@/lib/helpers/helpersAI';
import { LanguagesISO639 } from '@/lib/lists';
import { cn } from '@/lib/utils';

interface TopicDetailsProps {
  topic: BaseTutorTopic;
  relevantPhrases: any;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ topic, relevantPhrases }) => {
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const { lang: topicLanguage, level, instructions } = topic;
  const { userLanguage, prefLanguage } = useUserContext();
  const [prompt, setPrompt] = useState<string | undefined>(topic.prompt ?? undefined);

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
      await saveTopicPrompt({ topicId: topic.id, prompt });
      setButtonState('success');
    } catch (error: any) {
      setButtonState('error');
      throw new Error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col mt-4 w-full">
      <div className="relative flex pb-6">
        {prompt && (
          <div className="bg-slate-100 p-2 pb-4 rounded-lg ">
            <span className="text-slate-800 block italic">
              <Stars color={'#64748b'} size={18} className="float-left mr-2 flex-shrink-0" />
              <span className="text-sm font-medium break-words ">{prompt}</span>
            </span>
          </div>
        )}

        <LoadingButton
          onClick={handleInitiateLesson}
          className={cn(
            'w-fit bg-gradient-to-r from-blue-600 to-cyan-600',
            prompt && 'rounded-full w-10 absolute right-0 bottom-0'
          )}
          buttonState={buttonState}
          text={prompt ? <RefreshCw /> : 'Initiate lesson'}
          loadingText={
            !prompt ? (
              'Generating ...'
            ) : (
              <div className="animate-spin">
                <RefreshCw />
              </div>
            )
          }
          successText={<RefreshCw />}
          errorText="Something went wrong"
        />
      </div>

      <div className="mt-4">
        <GrammarCorrection />
      </div>
    </div>
  );
};

export default TopicDetails;

// const TestPrompt =
//   'Write a short paragraph about the importance of personal conversations in building relationships. Include your thoughts on how they can help us understand each other better.';
