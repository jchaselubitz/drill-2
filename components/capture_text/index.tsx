'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUserContext } from '@/contexts/user_context';
import { addPhrase } from '@/lib/actions/phraseActions';
import { getPhraseType } from '@/lib/helpers/helpersPhrase';
import { Languages, LanguagesISO639 } from '@/lib/lists';

import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

const CaptureText: React.FC = () => {
  const { prefLanguage } = useUserContext();

  const formSchema = z.object({
    text: z.string().min(3, 'Text is required'),
    lang: z.string().min(1, 'Language is required'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const defaultValues: Partial<FormValues> = { text: '', lang: prefLanguage ?? '' };

  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    const text = data.text;
    const lang = data.lang as LanguagesISO639;
    await addPhrase({ text, lang, source: 'home', type: getPhraseType(text) });
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg shadow-lg bg-gray-50 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-2">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Enter your text here" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.getValues('text') !== '' && (
            <>
              <FormField
                control={form.control}
                name="lang"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>{' '}
            </>
          )}
        </form>
      </Form>
    </div>
  );
};

export default CaptureText;
