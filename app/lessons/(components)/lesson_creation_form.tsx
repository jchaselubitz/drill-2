'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iso639LanguageCode } from 'kysely-codegen';
import { XIcon } from 'lucide-react';
import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import LightSuggestionList from '@/components/ai_elements/suggestions/light_suggestion_list';
import { Button } from '@/components/ui/button';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserContext } from '@/contexts/user_context';
import { createBlankLesson } from '@/lib/actions/lessonActions';
import { handleGeneratePhrases } from '@/lib/aiGenerators/generators_content';
import { getModelSelection, getOpenAiKey } from '@/lib/helpers/helpersAI';
import { requestLessonSuggestions } from '@/lib/helpers/promptGenerators';
import { ContentSuggestions } from '@/lib/lists';
import { createClient } from '@/utils/supabase/client';

import { OptionType } from './lesson_option';
import LessonOptionList from './lesson_option_list';

interface LessonCreationFormProps {
  subjectId: string;
  lang: Iso639LanguageCode;
}

export const LessonCreationForm: FC<LessonCreationFormProps> = ({ subjectId, lang }) => {
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const [showCreationForm, setShowCreationForm] = useState(false);
  const formSchema = z.object({
    title: z.string().min(3, 'Name is required'),
  });
  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues: { title: '' },
  });

  async function submitForm(data: FormValues) {
    const { title } = data;
    setButtonState('loading');
    try {
      await createBlankLesson({ title, shortDescription: lang, subjectId });
      setButtonState('success');
      setShowCreationForm(false);
    } catch (error) {
      setButtonState('error');
    }
  }

  if (!showCreationForm) {
    return (
      <Button onClick={() => setShowCreationForm(true)} variant={'outline'} className="w-fit">
        {`Create empty lesson`}
      </Button>
    );
  }
  return (
    <div className="p-4 bg-zinc-50 rounded-lg w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Create blank lesson</h2>
        <Button variant={'ghost'} size={'icon'} onClick={() => setShowCreationForm(false)}>
          <XIcon />{' '}
        </Button>
      </div>
      <Form {...form}>
        <form className="flex flex-col gap-2 w-full mb-5" onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <Label>Lesson name</Label>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="e.g. verb-adjective agreement"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <LoadingButton
            buttonState={buttonState}
            text="Save"
            loadingText="Saving..."
            errorText="Error"
          />
        </form>
      </Form>
    </div>
  );
};

interface LessonGenerationFormProps {
  subjectId: string;
  subjectLanguage: Iso639LanguageCode;
  subjectLevel: string;
  startOpen?: boolean;
}

const LessonGenerationForm: FC<LessonGenerationFormProps> = ({
  subjectId,
  subjectLanguage,
  subjectLevel,
  startOpen,
}) => {
  const [showCreationForm, setShowCreationForm] = useState(startOpen);
  const { userLanguage } = useUserContext();
  const [request, setRequest] = useState('');
  const [optionListObject, setOptionListObject] = useState<OptionType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGenerateCustomLesson = async () => {
    setIsLoading(true);
    setOptionListObject(null);

    if (request === '' || !userLanguage) {
      setIsLoading(false);
      return;
    }
    const phrasesArray = await handleGeneratePhrases({
      concept: request,
      studyLanguage: subjectLanguage,
      userLanguage: userLanguage,
      level: subjectLevel,
    });
    if (!phrasesArray) {
      setIsLoading(false);
      return;
    }
    setOptionListObject([{ title: request, description: subjectLevel, phrases: phrasesArray }]);
    setIsLoading(false);
  };

  const handleGenerateLessonSuggestions = async () => {
    setIsLoading(true);
    const { prompt, format } = requestLessonSuggestions({
      level: subjectLevel,
      language: subjectLanguage,
    });

    const modelParams = { format };
    const messages = [
      {
        role: 'system',
        content:
          'Return a JSON that is a list of objects, each including the "title" of the concept and a very short "description".',
      },
      { role: 'user', content: prompt },
    ];

    const { data } = await supabase.functions.invoke('gen-text', {
      body: {
        userApiKey: getOpenAiKey(),
        modelSelection: getModelSelection(),
        modelParams: modelParams,
        messages: messages,
      },
    });

    setOptionListObject(JSON.parse(data.content).concepts);

    setIsLoading(false);
  };

  const setMaterialSuggestion = (suggestion: string) => {
    setRequest(suggestion);
  };

  const formSchema = z.object({
    request: z.string().min(3, 'Text is required'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues: { request: '' },
  });

  if (!showCreationForm) {
    return (
      <Button onClick={() => setShowCreationForm(true)} variant={'outline'} className="w-fit">
        {`Generate a new lesson`}
      </Button>
    );
  }

  return (
    <div className="p-4 bg-zinc-50 rounded-lg w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Generate a lesson</h2>
        <Button variant={'ghost'} size={'icon'} onClick={() => setShowCreationForm(false)}>
          <XIcon />{' '}
        </Button>
      </div>
      <Form {...form}>
        <form className="flex flex-col gap-2 w-full mb-5">
          <Label>Describe the material you would like to drill</Label>
          <Textarea
            name="request"
            className="w-full"
            placeholder="e.g. verb-adjective agreement, or business and political topics"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
          />
          {request === '' && (
            <LightSuggestionList
              suggestions={ContentSuggestions}
              setMaterialSuggestion={setMaterialSuggestion}
              handleGenerateLessonSuggestions={handleGenerateLessonSuggestions}
              includeSuggestionCreator
              isLoading={isLoading}
            />
          )}

          {request !== '' && (
            <LoadingButton
              buttonState={isLoading ? 'loading' : 'default'}
              text="Generate Lesson"
              loadingText="Generating..."
              onClick={handleGenerateCustomLesson}
            />
          )}
        </form>
      </Form>
      {optionListObject && subjectLevel && userLanguage && subjectLanguage && (
        <LessonOptionList
          options={optionListObject}
          studyLanguage={subjectLanguage}
          userLanguage={userLanguage}
          level={subjectLevel}
          subjectId={subjectId}
        />
      )}
    </div>
  );
};

export default LessonGenerationForm;
