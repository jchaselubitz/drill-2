'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iso639LanguageCode, NewTutorTopic } from 'kysely-codegen';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/button-loading';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUserContext } from '@/contexts/user_context';
import { addTutorTopic } from '@/lib/actions/tutorActions';
import { Languages, Levels } from '@/lib/lists';
import { useRouter } from 'next/navigation';

interface TopicCreationFormProps {
  startOpen?: boolean;
}

const TopicCreationForm: React.FC<TopicCreationFormProps> = ({ startOpen }) => {
  const router = useRouter();
  const [showCreationForm, setShowCreationForm] = useState(startOpen);
  const { prefLanguage } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);

  // const setTopicSuggestions = (suggestion: string) => {
  //   setRequest(suggestion);
  // };

  const handleCreateTopic = async () => {
    const { language, level, instructions } = form.getValues();
    setIsLoading(true);
    if (!language || !level) {
      alert('Please select a language and level');
      setIsLoading(false);
      return;
    }

    const newTopicId = await addTutorTopic({
      instructions: instructions,
      lang: language,
      level: level,
    } as NewTutorTopic);
    setIsLoading(false);
    if (newTopicId) {
      router.push(`/tutor/${newTopicId}`);
    }
  };
  const formSchema = z.object({
    language: z.string().min(2, 'Language is required'),
    level: z.string().min(1, 'Level is required'),
    instructions: z.string().min(4, 'Instructions are required'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues: { level: '', language: prefLanguage ?? '' },
  });

  if (!showCreationForm) {
    return (
      <Button onClick={() => setShowCreationForm(true)} variant={'outline'} className="w-fit">
        Create a new topic
      </Button>
    );
  }

  return (
    <div className="p-4 bg-zinc-50 rounded-lg w-full ">
      <Form {...form}>
        <form className="flex flex-col gap-3 w-full mb-5">
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
                      <SelectItem key={language.value as Iso639LanguageCode} value={language.value}>
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
          <div className="mt-4 mb-1">
            <Label>Describe the subject you would like to drill</Label>
          </div>
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <Textarea
                  {...field}
                  placeholder="e.g. verb-adjective agreement, or business and political topics"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {form.getValues('instructions') !== '' && (
            <LoadingButton
              buttonState={isLoading ? 'loading' : 'default'}
              text="Generate Topic"
              loadingText="Generating..."
              onClick={form.handleSubmit(handleCreateTopic)}
            />
          )}
        </form>
      </Form>
    </div>
  );
};

export default TopicCreationForm;
