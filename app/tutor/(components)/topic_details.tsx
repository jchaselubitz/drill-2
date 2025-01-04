'use client';

import { TutorTopicWithCorrections } from 'kysely-codegen';
import { RefreshCw, Stars } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import GrammarCorrectionForm from '@/components/ai_elements/grammar_correction_form';
import GrammarCorrectionItem from '@/components/ai_elements/grammar_correction_item';
import { AILoadingButton } from '@/components/specialButtons/ai_button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { Separator } from '@/components/ui/separator';
import { useUserContext } from '@/contexts/user_context';
import { saveTopicPrompt, saveTopicResponse } from '@/lib/actions/tutorActions';
import {
  changePromptLength,
  generateTutorPrompt,
  ReviewUserParagraphSubmissionResponse,
} from '@/lib/aiGenerators/generators_tutor';
import { removeMarkdownNotation } from '@/lib/helpers/helpersPhrase';
import { LanguagesISO639 } from '@/lib/lists';
import { cn } from '@/lib/utils';

interface TopicDetailsProps {
  topic: TutorTopicWithCorrections;
  relevantPhrases: any;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ topic, relevantPhrases }) => {
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const [shortenButtonState, setShortenButtonState] = useState<ButtonLoadingState>('default');
  const [lengthenButtonState, setLengthenButtonState] = useState<ButtonLoadingState>('default');
  const { lang: topicLanguage, level, instructions, corrections } = topic;
  const { userLanguage, prefLanguage } = useUserContext();
  const [prompt, setPrompt] = useState<string | undefined>(topic.prompt ?? undefined);
  const [openItem, setOpenItem] = useState<string>(topic.corrections[0]?.id ?? '');

  useEffect(() => {
    if (topic.corrections) {
      setOpenItem(topic.corrections[0]?.id);
    }
  }, [topic.corrections]);

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

  const handleChangePromptLength = async (length: 'shorter' | 'longer') => {
    length === 'shorter' ? setShortenButtonState('loading') : setLengthenButtonState('loading');
    if (!prompt) {
      alert('No prompt to shorten');
      return;
    }
    try {
      const newPrompt = await changePromptLength({
        prompt,
        length,
      });
      setPrompt(newPrompt);
      await saveTopicPrompt({ topicId: topic.id, prompt });
      length === 'shorter' ? setShortenButtonState('default') : setLengthenButtonState('default');
    } catch (error: any) {
      length === 'shorter' ? setShortenButtonState('error') : setLengthenButtonState('error');
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
    try {
      await saveTopicResponse({ topicId: topic.id, response, userText });
    } catch (error: any) {
      throw new Error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col mt-4 w-full">
      <div className="relative flex flex-col pb-6">
        {prompt && (
          <div className="bg-slate-100 p-2 pb-4 rounded-lg ">
            <span className="text-slate-800 block italic">
              <Stars color={'#64748b'} size={18} className="float-left mr-2 flex-shrink-0" />
              <span className="text-sm font-medium break-words ">{prompt}</span>
            </span>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-2">
          {!!prompt && (
            <>
              <AILoadingButton
                onClick={() => handleChangePromptLength('shorter')}
                className="w-fit bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg "
                buttonState={shortenButtonState}
                text={'Shorter'}
                loadingText={'Shortening ...'}
                successText={'Shorter'}
                errorText="Something went wrong"
              />
              <AILoadingButton
                onClick={() => handleChangePromptLength('longer')}
                className="w-fit bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg 0"
                buttonState={lengthenButtonState}
                text={'Longer'}
                loadingText={'Lengthening ...'}
                successText={'Longer'}
                errorText="Something went wrong"
              />
            </>
          )}
          <AILoadingButton
            onClick={handleInitiateLesson}
            className={cn(
              'w-fit bg-gradient-to-r from-blue-600 to-cyan-600',
              prompt && 'rounded-full w-10 '
            )}
            buttonState={buttonState}
            text={prompt ? <RefreshCw /> : 'Generate prompt'}
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
      </div>

      <div className="mt-4">
        <div>
          <GrammarCorrectionForm onResponse={onResponseSubmit} />{' '}
          {corrections.length > 0 && <Separator className="my-4" />}
        </div>
        {corrections && (
          <Accordion
            type="multiple"
            className="w-full"
            value={[openItem]}
            onValueChange={(v) => setOpenItem(v[1])}
          >
            <div className="flex flex-col gap-2">
              {corrections.map((existingCorrection, index) => (
                <AccordionItem
                  className="w-full border-b-0 rounded-lg  hover:border px-4  data-[state=open]:bg-zinc-100 data-[state=open]:shadow-lg data-[state=open]:border-0"
                  value={existingCorrection.id}
                  key={existingCorrection.id}
                >
                  <AccordionTrigger className="flex w-full border-b-0 hover:no-underline ">
                    <span className="text-left line-clamp-1 ">
                      {corrections.length - index}.{' '}
                      {removeMarkdownNotation(existingCorrection.response.correction)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <GrammarCorrectionItem
                      correction={existingCorrection}
                      learningLang={topic.lang}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default TopicDetails;

const TestPrompt =
  'Write a short paragraph about the importance of personal conversations in building relationships. Include your thoughts on how they can help us understand each other better.';

// Anna ist eine teenager im Gymnasium. Sie vergessen immer, ihre Hände zu wachen. Ihre Freunde denken, dass das ist sehr furchbar, und sie sie tease.
