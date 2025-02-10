'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Iso639LanguageCode } from 'kysely-codegen';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateModal } from '@/contexts/create_modal_context';
import { useUserContext } from '@/contexts/user_context';
import { addPhrase } from '@/lib/actions/phraseActions';
import { getPhraseType } from '@/lib/helpers/helpersPhrase';
import { Languages } from '@/lib/lists';

import { ButtonLoadingState, LoadingButton } from '../ui/button-loading';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { createClient } from '@/utils/supabase/client';
import { LangCheckStructure } from '@/lib/aiGenerators/types_generation';

const CaptureText: React.FC = () => {
  const { prefLanguage } = useUserContext();
  const { setModalOpen } = useCreateModal();
  const supabase = createClient();

  const [buttonState, setButtonState] = React.useState<ButtonLoadingState>('default');

  const formSchema = z.object({
    text: z.string(),
    lang: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const defaultValues: Partial<FormValues> = { text: '', lang: '' };

  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    const text = data.text;
    const selectedLang = data.lang as Iso639LanguageCode | '';
    setButtonState('loading');
    const { data: autoLang, error: langError } = await supabase.functions.invoke('check-language', {
      body: {
        text: text,
        format: LangCheckStructure,
      },
    });
    if (langError) {
      setButtonState('error');
      throw Error(`Error checking language: ${langError}`);
    }
    const lang = selectedLang !== '' ? selectedLang : (JSON.parse(autoLang)?.lng ?? prefLanguage);

    try {
      await addPhrase({
        text,
        lang,
        source: 'home',
        type: getPhraseType(text),
      });
      setButtonState('success');
    } catch (error) {
      setButtonState('error');
    }
    form.reset();
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-2">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Enter text you want to save" />
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
                          <SelectValue placeholder="Detect language automatically" />
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
              <LoadingButton
                type="submit"
                buttonState={buttonState}
                text={'Submit'}
                loadingText={'Saving ...'}
                errorText="Something went wrong."
                reset
                setButtonState={setButtonState}
              />
            </>
          )}
        </form>
      </Form>
    </div>
  );
};

export default CaptureText;
