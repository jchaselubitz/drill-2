'use client';

import { TutorTopicWithCorrections } from 'kysely-codegen';
import { RefreshCw, Stars } from 'lucide-react';
import React, { useState } from 'react';
import GrammarCorrectionForm from '@/components/ai_elements/grammar_correction_form';
import GrammarCorrectionItem from '@/components/ai_elements/grammar_correction_item';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { useUserContext } from '@/contexts/user_context';
import { saveTopicPrompt, saveTopicResponse } from '@/lib/actions/tutorActions';
import {
  generateTutorPrompt,
  ReviewUserParagraphSubmissionResponse,
} from '@/lib/helpers/helpersAI';
import { LanguagesISO639 } from '@/lib/lists';
import { cn } from '@/lib/utils';

interface TopicDetailsProps {
  topic: TutorTopicWithCorrections;
  relevantPhrases: any;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ topic, relevantPhrases }) => {
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const { lang: topicLanguage, level, instructions, corrections } = topic;
  const { userLanguage, prefLanguage } = useUserContext();
  const [prompt, setPrompt] = useState<string | undefined>(TestPrompt);

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
      await saveTopicPrompt({ topic, prompt });
      setButtonState('success');
    } catch (error: any) {
      setButtonState('error');
      throw new Error('Error:', error);
    }
  };

  const onResponseSubmit = async ({
    response,
    userText,
  }: {
    response: ReviewUserParagraphSubmissionResponse;
    userText: string;
  }) => {
    console.log('onResponseSubmit', response);
    try {
      await saveTopicResponse({ topicId: topic.id, response, userText });
    } catch (error: any) {
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
        {corrections && (
          <Accordion type="multiple" className="flex flex-col items-center gap-4 w-full">
            {corrections.map((existingCorrection, index) => (
              <AccordionItem
                className="mt-4 w-full"
                value={existingCorrection.id}
                key={existingCorrection.id}
              >
                <AccordionTrigger className="w-full">Response: {index + 1} </AccordionTrigger>
                <AccordionContent>
                  <GrammarCorrectionItem correction={existingCorrection} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        <GrammarCorrectionForm onResponse={onResponseSubmit} />
      </div>
    </div>
  );
};

export default TopicDetails;

const TestPrompt =
  'Write a short paragraph about the importance of personal conversations in building relationships. Include your thoughts on how they can help us understand each other better.';
