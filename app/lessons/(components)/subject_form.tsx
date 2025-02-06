'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iso639LanguageCode } from 'kysely-codegen';
import { XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserContext } from '@/contexts/user_context';
import { createSubject } from '@/lib/actions/lessonActions';
import { Languages, Levels } from '@/lib/lists';

const SubjectCreateForm: React.FC<{ startOpen?: boolean }> = ({ startOpen }) => {
  const [showCreationForm, setShowCreationForm] = useState(startOpen);
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const { prefLanguage } = useUserContext();

  const formSchema = z.object({
    language: z.string().min(3, 'Text is required'),
    level: z.string().min(1, 'Language is required'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues: { level: '', language: prefLanguage ?? '' },
  });

  const handleSetSubject = async () => {
    const { language, level } = form.getValues();
    setButtonState('loading');
    try {
      await createSubject({ lang: language as Iso639LanguageCode, level });
      setButtonState('success');
      setShowCreationForm(false);
    } catch (error) {
      setButtonState('error');
    }
  };
  if (!showCreationForm) {
    return (
      <Button onClick={() => setShowCreationForm(true)} variant={'outline'} className="w-fit">
        {`Create a new subject`}
      </Button>
    );
  }

  return (
    <div className="p-4 bg-zinc-50 rounded-lg w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Create a subject</h2>
        <Button variant={'ghost'} size={'icon'} onClick={() => setShowCreationForm(false)}>
          <XIcon />{' '}
        </Button>
      </div>
      <Form {...form}>
        <form className="flex flex-col gap-2 w-full mb-5">
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

          <LoadingButton
            buttonState={buttonState}
            text="Create subject"
            loadingText="creating..."
            errorText="Error creating subject"
            onClick={handleSetSubject}
          />
        </form>
      </Form>
    </div>
  );
};

export default SubjectCreateForm;
