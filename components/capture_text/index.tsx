'use client';

import React from 'react';
import { addPhrase } from '@/lib/actions/captureActions';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Languages } from '@/lib/lists';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface CaptureTextProps {
  prefLanguage: string;
}

const CaptureText: React.FC<CaptureTextProps> = ({ prefLanguage }) => {
  const formSchema = z.object({
    text: z.string().min(3, 'Text is required'),
    lang: z.string().min(1, 'Language is required'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const defaultValues: Partial<FormValues> = { text: '', lang: prefLanguage };

  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    await addPhrase(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter your text here" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lang"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default CaptureText;
