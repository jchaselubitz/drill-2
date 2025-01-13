'use client';

import { BaseTutorPrompt, Iso639LanguageCode, TutorTopicWithCorrections } from 'kysely-codegen';
import { RefreshCw, Stars } from 'lucide-react';
import React, { useState } from 'react';
import GrammarCorrectionForm from '@/components/ai_elements/grammar_correction_form';
import GrammarCorrectionItem from '@/components/ai_elements/grammar_correction_item';
import { AILoadingButton } from '@/components/specialButtons/ai_button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ButtonLoadingState } from '@/components/ui/button-loading';
import { Separator } from '@/components/ui/separator';
import { useTutorContext } from '@/contexts/tutor_context';
import { useUserContext } from '@/contexts/user_context';
import { saveTopicPrompt, saveTopicResponse, updatePromptText } from '@/lib/actions/tutorActions';
import {
  changePromptLength,
  generateTutorPrompt,
  ReviewUserParagraphSubmissionResponse,
} from '@/lib/aiGenerators/generators_tutor';
import { removeMarkdownNotation } from '@/lib/helpers/helpersPhrase';
import { cn } from '@/lib/utils';

interface TopicPromptProps {
  topic: TutorTopicWithCorrections;
  prompt: BaseTutorPrompt;
  selectedPrompt: string | null;
  relevantPhrases: any;
}

const TopicPrompt: React.FC<TopicPromptProps> = ({
  topic,
  prompt,
  selectedPrompt,
  relevantPhrases,
}) => {
  const { selectedPromptAndCorrection, setSelectedPromptAndCorrection } = useTutorContext();
  const selectedCorrection = selectedPromptAndCorrection?.correctionId;

  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const [shortenButtonState, setShortenButtonState] = useState<ButtonLoadingState>('default');
  const [lengthenButtonState, setLengthenButtonState] = useState<ButtonLoadingState>('default');
  const { id: topicId, lang: topicLanguage, level, instructions } = topic;
  const corrections = prompt?.corrections;
  const promptId = prompt?.id as string;

  const { userLanguage, prefLanguage } = useUserContext();

  const [promptText, setPrompt] = useState<string | undefined>(prompt?.text ?? undefined);

  const preparedPhrases = relevantPhrases.map((phrase: any) => phrase.text);

  const handleSetNewPrompt = async () => {
    setButtonState('loading');
    if (!userLanguage || !topicLanguage || !level || !instructions) {
      alert('Missing information. Please try again.');
      return;
    }
    try {
      const newPrompt = await generateTutorPrompt({
        relatedPhraseArray: JSON.stringify(preparedPhrases),
        userLanguage,
        topicLanguage: (topicLanguage as Iso639LanguageCode) ?? prefLanguage,
        level,
        instructions,
      });
      setPrompt(newPrompt);
      await saveTopicPrompt({ topicId, newPrompt });
      setButtonState('success');
    } catch (error: any) {
      setButtonState('error');
      throw new Error('Error:', error);
    }
  };

  const handleChangePromptLength = async (length: 'shorter' | 'longer') => {
    length === 'shorter' ? setShortenButtonState('loading') : setLengthenButtonState('loading');
    if (!promptText) {
      alert('No prompt to shorten');
      return;
    }
    try {
      const newPrompt = await changePromptLength({
        promptText,
        length,
      });
      setPrompt(newPrompt);
      await updatePromptText({ promptId, newPrompt });
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
      const correctionId = await saveTopicResponse({ promptId, response, userText });
      setSelectedPromptAndCorrection({
        promptId: promptId,
        correctionId: correctionId,
      });
    } catch (error: any) {
      throw new Error('Error:', error);
    }
  };

  const handleOpenClick = () => {
    setSelectedPromptAndCorrection({
      promptId: selectedPrompt === promptId ? null : promptId,
      correctionId: null,
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col w-full border border-slate-100 rounded-lg cursor-pointer',
        selectedPrompt === promptId && ' bg-white shadow-md '
      )}
    >
      <div className="relative flex flex-col ">
        <div className="bg-slate-100 p-2 pb-4 rounded-lg " onClick={handleOpenClick}>
          <span className="text-slate-800 block italic">
            <Stars color={'#64748b'} size={18} className="float-left mr-2 flex-shrink-0" />
            <span className="text-sm font-medium break-words ">{promptText}</span>
          </span>
        </div>

        {selectedPrompt === promptId && (
          <div className="p-4 mb-2">
            <div className="flex justify-end gap-2 mt-2">
              <AILoadingButton
                onClick={() => handleChangePromptLength('shorter')}
                className="w-fit bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg "
                buttonState={shortenButtonState}
                reset
                setButtonState={setShortenButtonState}
                text={'Shorter'}
                loadingText={'Shortening ...'}
                successText={'Shorter'}
                errorText="Something went wrong"
              />
              <AILoadingButton
                onClick={() => handleChangePromptLength('longer')}
                className="w-fit bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg 0"
                buttonState={lengthenButtonState}
                reset
                setButtonState={setLengthenButtonState}
                text={'Longer'}
                loadingText={'Lengthening ...'}
                successText={'Longer'}
                errorText="Something went wrong"
              />

              <AILoadingButton
                onClick={handleSetNewPrompt}
                className={cn('bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full w-10')}
                buttonState={buttonState}
                text={prompt ? <RefreshCw /> : 'Generate prompt'}
                loadingText={
                  <div className="animate-spin">
                    <RefreshCw />
                  </div>
                }
                successText={<RefreshCw />}
                errorText="Something went wrong"
              />
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {corrections && (
                <Accordion
                  type="multiple"
                  className="w-full"
                  value={selectedCorrection ? [selectedCorrection] : []}
                  onValueChange={(value) => {
                    setSelectedPromptAndCorrection({
                      promptId: promptId,
                      correctionId: value[0] as string,
                    });
                  }}
                >
                  <div className="flex flex-col gap-2">
                    {corrections.map((existingCorrection, index) => (
                      <AccordionItem
                        className="w-full border-b-0 rounded-lg  hover:border px-4  data-[state=open]:bg-zinc-100 data-[state=open]:shadow-lg data-[state=open]:border-0"
                        value={existingCorrection.id}
                        key={existingCorrection.id}
                      >
                        <AccordionTrigger className="flex w-full border-b-0 hover:no-underline ">
                          <div
                            className={cn(
                              'text-left flex',
                              existingCorrection.id.toString() !== selectedCorrection?.toString() &&
                                'line-clamp-1'
                            )}
                          >
                            {index + 1}.{' '}
                            {/* <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}> */}
                            {removeMarkdownNotation(existingCorrection.userText)}
                            {/* </Markdown> */}
                          </div>
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
              )}{' '}
              {corrections && corrections.length > 0 && <Separator className="my-4" />}
              <GrammarCorrectionForm onResponse={onResponseSubmit} />{' '}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicPrompt;

const TestPrompt =
  'Write a short paragraph about the importance of personal conversations in building relationships. Include your thoughts on how they can help us understand each other better.';

// Anna ist eine teenager im Gymnasium. Sie vergessen immer, ihre Hände zu wachen. Ihre Freunde denken, dass das ist sehr furchbar, und sie sie tease.
