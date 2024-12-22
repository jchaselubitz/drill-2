'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useChatContext } from '@/contexts/chat_window_context';
import {
  reviewUserParagraphSubmission,
  ReviewUserParagraphSubmissionResponse,
} from '@/lib/helpers/helpersAI';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface GrammarCorrectionProps {
  className?: string;
}

const GrammarCorrection: React.FC<GrammarCorrectionProps> = ({ className }) => {
  const { setChatContext, setChatOpen } = useChatContext();
  const [submitState, setSubmitState] = useState<ButtonLoadingState>('default');

  const [response, setResponse] = useState<ReviewUserParagraphSubmissionResponse | undefined>(
    undefined
  );

  const chatSystemMessage =
    "You are a tutor who's job is to help the user learn the relevant language";

  const openInChat = () => {
    setChatContext({
      systemMessage: chatSystemMessage,
      matterText: form.getValues('text'),
      assistantAnswer: `**Correction:** ${response?.correction}  **Feedback:** ${response?.feedback}`,
    });
    setChatOpen(true);
  };

  const handleResponseChange = async () => {
    setSubmitState('loading');
    const text = form.getValues('text');
    try {
      const review = await reviewUserParagraphSubmission({ paragraph: text });
      setResponse(review);

      setSubmitState('success');
    } catch (error: any) {
      setSubmitState('error');
      throw new Error('Error:', error);
    }
  };

  const form = useForm({
    defaultValues: {
      text: '',
      // text: testGermanText,
    },
  });

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Form {...form}>
        <form className="flex flex-col gap-2 w-full">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <Textarea {...field} rows={7} placeholder="Write your response here..." />
              </FormItem>
            )}
          />

          <LoadingButton
            className="w-fit"
            type="submit"
            onClick={form.handleSubmit(handleResponseChange)}
            buttonState={submitState}
            text={'Submit'}
            loadingText={'Correcting ...'}
            successText={'Corrected'}
          />
        </form>
        {response && (
          <div className="flex flex-col gap-4 mt-4">
            <div className="space-x-2">
              <div className="text-xs uppercase font-semibold">Correction:</div>
              <div className="prose ">
                <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{response.correction}</Markdown>
              </div>
            </div>
            <div className="space-x-2">
              <div className="text-xs uppercase font-semibold">Feedback:</div>
              <div className="prose ">
                <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {response.feedback.toString()}
                </Markdown>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white w-fit "
              onClick={openInChat}
            >
              Discuss in chat
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default GrammarCorrection;

// const testGermanText = `Eine Freund von mir sprecht viel und ist sehr laut. Sie ist sehr nett und hilfsbereit. Sie ist auch sehr lustig und wir lachen oft zusammen. Sie ist sehr gut in Mathe und hilft mir oft mit meinen Hausaufgaben. Sie ist auch sehr gut in Sport und spielt Fußball. Sie ist sehr sportlich und geht oft ins Fitnessstudio.`;
