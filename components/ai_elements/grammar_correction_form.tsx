'use client';

import { Label } from '@radix-ui/react-dropdown-menu';
import { BaseCorrection } from 'kysely-codegen';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useChatContext } from '@/contexts/chat_window_context';
import { useUserContext } from '@/contexts/user_context';
import {
  reviewUserParagraphSubmission,
  ReviewUserParagraphSubmissionResponse,
} from '@/lib/aiGenerators/generators_tutor';
import { processHistory } from '@/lib/helpers/helpersHistory';
import { cn } from '@/lib/utils';

interface GrammarCorrectionFormProps {
  className?: string;
  existingCorrection?: BaseCorrection;
  onResponse?: ({
    response,
    userText,
  }: {
    response: ReviewUserParagraphSubmissionResponse;
    userText: string;
  }) => Promise<void>;
}

const GrammarCorrectionForm: React.FC<GrammarCorrectionFormProps> = ({ className, onResponse }) => {
  const { prefLanguage, history } = useUserContext();
  const { currentLang } = useChatContext();
  const [submitState, setSubmitState] = useState<ButtonLoadingState>('default');
  const [response, setResponse] = useState<ReviewUserParagraphSubmissionResponse | undefined>(
    undefined
  );

  const learningLang = currentLang ?? prefLanguage;
  const existingHistory = history?.find((h) => h.lang === learningLang);

  const handleResponseChange = async () => {
    setSubmitState('loading');
    const text = form.getValues('text');
    try {
      const review = await reviewUserParagraphSubmission({ paragraph: text });
      setResponse(review);
      await onResponse?.({ response: review, userText: text });
      setSubmitState('success');
      await processHistory({
        messages: [{ role: 'assistant', content: JSON.stringify(review) }],
        existingHistory,
        learningLang,
      });
    } catch (error: any) {
      setSubmitState('error');
      throw new Error('Error:', error);
    }
    form.reset();
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
                <Label className="text-xs uppercase font-semibold">Your response:</Label>
                <Textarea
                  {...field}
                  placeholder={response ? 'Try again?' : 'Write your response here...'}
                />
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
            errorText={'An error occurred'}
          />
        </form>
      </Form>
    </div>
  );
};

export default GrammarCorrectionForm;

const testGermanText = `Eine Freund von mir sprecht viel und ist sehr laut. Sie ist sehr nett und hilfsbereit. Sie ist auch sehr lustig und wir lachen oft zusammen. Sie ist sehr gut in Mathe und hilft mir oft mit meinen Hausaufgaben. Sie ist auch sehr gut in Sport und spielt Fußball. Sie ist sehr sportlich und geht oft ins Fitnessstudio.`;
