'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CameraIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviewImage from '@/components/images/preview_image';
import { Button } from '@/components/ui/button';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitFeedback, uploadFeedbackImage } from '@/lib/actions/feedbackActions';
import { fileToImageUrl, handleImageCompression } from '@/lib/helpers/helpersImages';

const FeedbackFormSchema = z.object({
  image: z.any().optional(),
  description: z.string({ message: 'Please include a description.' }).max(2000).min(20),
});

type FeedbackFormValues = z.infer<typeof FeedbackFormSchema>;

const defaultValues: Partial<FeedbackFormValues> = {
  description: '',
  image: null,
};

export function FeedbackForm() {
  const router = useRouter();
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(FeedbackFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files?.length ? Array.from(event.target.files) : null;
    if (files && files.length > 0) {
      files.map(async (file) => {
        try {
          const compressedFile = await handleImageCompression(file);
          if (!compressedFile) return;
          const imageUrl = await fileToImageUrl(compressedFile);
          setImages((prevImages) => [...prevImages, compressedFile]);
          setImageUrls((prevImageUrls) => [...prevImageUrls, imageUrl]);
        } catch (error) {
          console.error(error);
        }
      });
    }
  };
  const handlePhotoButtonClick = () => {
    if (photoInputRef.current !== null) {
      photoInputRef.current.click();
    }
  };

  const handleImageRemove = (index: number) => {
    if (images) {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    }
    if (imageUrls) {
      const newImageUrls = [...imageUrls];
      newImageUrls.splice(index, 1);
      setImageUrls(newImageUrls);
    }
  };

  async function onSubmit(data: FeedbackFormValues) {
    const confirmation = confirm(
      `**Before you submit** 
    
Do not include any personal information in your submission. If you have, click CANCEL below and remove it.`
    );
    if (!confirmation) return;
    const { description } = data;
    setButtonState('loading');
    try {
      const feedbackId = await submitFeedback({
        description,
      });

      if (images.length > 0 && feedbackId) {
        const imageUploads = images.map(async (image) => {
          const fileFormData = new FormData();
          fileFormData.append('image', image);
          await uploadFeedbackImage({
            file: fileFormData,
            feedbackId: feedbackId,
            fileName: image.name,
          });
        });
        await Promise.all(imageUploads);
        setImageUrls([]);
      }
    } catch (e: any) {
      setButtonState('error');
      return;
    }
    setButtonState('success');
    router.push(`/feedback`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue or Feature Description (Required)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue you're experiencing or the feature you're requesting."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                It helps to be as descriptive as possible. If you are reporting an issue please
                include the steps required to reproduce it. If you are offering a feature request,
                please describe the feature and explain why it would be useful.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl onChange={handleImageChange}>
                <Input
                  {...field}
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  // capture="environment"
                  // style={{ visibility: 'hidden', position: 'absolute' }}
                  multiple
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex flex-wrap  gap-6">
          {imageUrls.map((image, i) => (
            <PreviewImage
              key={i}
              image={image}
              handleImageRemove={() => handleImageRemove(i)}
              classNames="w-fit"
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            handlePhotoButtonClick();
          }}
        >
          {imageUrls.length === 0 ? (
            <>
              <CameraIcon className="w-6 h-6" /> Add Photos
            </>
          ) : (
            <PlusIcon />
          )}
        </Button>
        <div>
          <LoadingButton
            type="submit"
            buttonState={buttonState}
            text={'Submit public feedback'}
            loadingText={'Submitting ...'}
            successText="Submitted"
          />
        </div>
      </form>
    </Form>
  );
}
