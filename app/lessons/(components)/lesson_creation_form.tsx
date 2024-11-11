'use client';
import LessonOptionList from './lesson_option_list';
import LightSuggestionList from '@/components/ai_elements/suggestions/light_suggestion_list';
import React, { useState } from 'react';
import { ContentSuggestions, Languages, LanguagesISO639, Levels } from '@/lib/lists';
import { createClient } from '@/utils/supabase/client';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { getModelSelection, getOpenAiKey } from '@/lib/helpers/helpersAI';
import { Iso639LanguageCode } from 'kysely-codegen';
import { Label } from '@/components/ui/label';
import {
  lessonGenerationSystemInstructions,
  phraseGenerationSystemInstructions,
  phraseResponseChecks,
  requestLessonSuggestions,
  requestPhraseSuggestions,
} from '@/lib/helpers/promptGenerators';
import { LoadingButton } from '@/components/ui/button-loading';
import { OptionType } from './lesson_option';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useUserContext } from '@/contexts/user_context';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface LessonCreationFormProps {
  subjectId?: string | undefined;
  subjectLanguage?: LanguagesISO639;
  subjectLevel?: string | null;
}

const LessonCreationForm: React.FC<LessonCreationFormProps> = ({
  subjectId,
  subjectLanguage,
  subjectLevel,
}) => {
  if (subjectId && (!subjectLanguage || !subjectLevel)) {
    throw new Error('Subject ID provided without language or level');
  }
  const { userLanguage, prefLanguage } = useUserContext();
  const [level, setLevel] = useState(subjectLevel);
  const [studyLanguage, setStudyLanguage] = useState<LanguagesISO639 | undefined>(subjectLanguage);
  const [request, setRequest] = useState('');
  const [optionListObject, setOptionListObject] = useState<OptionType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGenerateCustomLesson = async () => {
    const level = form.getValues('level');
    const language = form.getValues('language') as LanguagesISO639 | '';

    if (level === '' || language === '' || !userLanguage || request === '') {
      alert('Please select a language and level');
      return;
    }
    setIsLoading(true);
    const { prompt, format } = requestPhraseSuggestions({
      userLanguage: userLanguage,
      studyLanguage: language,
      level: level,
      concept: request,
    });

    const modelParams = { format: format };
    const messages = [
      {
        role: 'system',
        content: phraseGenerationSystemInstructions({ lang1: userLanguage, lang2: language }),
      },
      { role: 'user', content: prompt },
    ];

    const { data, error } = await supabase.functions.invoke('gen-text', {
      body: {
        userApiKey: getOpenAiKey(),
        modelSelection: getModelSelection(),
        modelParams: modelParams,
        messages: messages,
      },
    });

    const phrasesArray = phraseResponseChecks({
      response: data as string,
      lang1: userLanguage,
      lang2: language,
    });
    setOptionListObject([{ title: request, description: level, phrases: phrasesArray }]);
    setLevel(level);
    setStudyLanguage(language);
    setIsLoading(false);
  };

  const handleGenerateLessonSuggestions = async () => {
    const level = form.getValues('level');
    const studyLanguage = form.getValues('language') as LanguagesISO639 | '';
    if (level === '' || studyLanguage === '') {
      alert('Please select a language and level');
      return;
    }
    setIsLoading(true);
    const { prompt, format } = requestLessonSuggestions({ level, language: studyLanguage });

    const modelParams = { format: format };
    const messages = [
      {
        role: 'system',
        content: lessonGenerationSystemInstructions,
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

    setOptionListObject(JSON.parse(data).concepts);

    setIsLoading(false);
  };

  const setMaterialSuggestion = (suggestion: string) => {
    setRequest(suggestion);
  };

  const formSchema = z.object({
    language: z.string().min(3, 'Text is required'),
    level: z.string().min(1, 'Language is required'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues: { level: level ?? '', language: studyLanguage ?? prefLanguage ?? '' },
  });

  return (
    <div>
      <Form {...form}>
        <form className="flex flex-col gap-2 w-full">
          {!subjectId && (
            <>
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(v) => field.onChange(v)}
                      defaultValue={field.value as string}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Languages.map((language) => (
                          <SelectItem
                            key={language.value as Iso639LanguageCode}
                            value={language.value}
                          >
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(v) => field.onChange(v)}
                      defaultValue={field.value as string}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Levels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <Label>Describe the material you would like to drill</Label>
          <Textarea
            name="request"
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
              className="bg-blue-600 rounded-lg text-white p-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              buttonState={isLoading ? 'loading' : 'default'}
              text="Generate Lesson"
              loadingText="Generating..."
              onClick={handleGenerateCustomLesson}
            />
          )}
        </form>
      </Form>
      {optionListObject && level && userLanguage && studyLanguage && (
        <LessonOptionList
          options={optionListObject}
          studyLanguage={studyLanguage}
          userLanguage={userLanguage}
          level={level}
          subjectId={subjectId}
        />
      )}
    </div>
  );
};

export default LessonCreationForm;
