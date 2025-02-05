'use client';

import { BaseFeedback } from 'kysely-codegen';
import { ArrowBigDown, ArrowBigUp, CameraIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { startTransition, Suspense, useOptimistic, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviewImage from '@/components/images/preview_image';
import { Button } from '@/components/ui/button';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import UnstyledDate from '@/components/unstyled_date';
import {
  toggleResolved,
  updateFeedbackVotes,
  uploadFeedbackImage,
} from '@/lib/actions/feedbackActions';
import { fileToImageUrl, handleImageCompression } from '@/lib/helpers/helpersImages';

interface FeedbackCardProps {
  feedback: BaseFeedback;
  feedbackImages: { signedUrl: string }[];
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, feedbackImages }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [optFeedback, setOptFeedback] = useOptimistic<BaseFeedback, BaseFeedback>(
    feedback,
    (state, newFeedback) => {
      return { ...state, ...newFeedback };
    }
  );

  async function handleUpdateVote(vote: number) {
    const totalVotes = feedback.votes + vote;
    if (totalVotes < 1) return;
    startTransition(() => {
      setOptFeedback({
        ...feedback,
        votes: totalVotes,
      });
    });
    await updateFeedbackVotes({
      feedbackId: feedback.id,
      votes: totalVotes,
    });
  }

  const FormSchema = z.object({
    image: z.any().optional(),
  });

  type FormValues = z.infer<typeof FormSchema>;

  const form = useForm({
    defaultValues: { image: '' },
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

  const handleToggleResolved = async () => {
    startTransition(() => {
      setOptFeedback({
        ...feedback,
        status: feedback.status === 1 ? 0 : 1,
      });
    });
    await toggleResolved({
      feedbackId: feedback.id,
      status: feedback.status === 1 ? 0 : 1,
    });
  };

  async function onSubmit(data: FormValues) {
    setButtonState('loading');
    try {
      if (images.length > 0 && feedback.id) {
        const imageUploads = images.map(async (image) => {
          const fileFormData = new FormData();
          fileFormData.append('image', image);
          await uploadFeedbackImage({
            file: fileFormData,
            feedbackId: feedback.id,
            fileName: image.name,
          });
        });
        await Promise.all(imageUploads);
        router.refresh();
      }
    } catch (e: any) {
      setButtonState('error');
      return;
    }
    setButtonState('success');
  }

  return (
    <Card key={feedback.id} className="p-2 ">
      <div
        className="flex flex-col md:flex-row justify-between md:items-center gap-4"
        onClick={() => {
          setIsExpanded(!isExpanded);
          form.reset();
        }}
      >
        <div>
          <p className="text-sm text-muted-foreground">
            <UnstyledDate date={feedback.createdAt} />
          </p>
          <div className="flex justify-between"></div>
          <p className="">{feedback.description}</p>
        </div>
        {optFeedback.status === 1 ? (
          <div className="rounded-full bg-gray-500 p-1 px-2 text-white text-xs">Resolved</div>
        ) : (
          <div className="flex flex-row items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button onClick={() => handleUpdateVote(1)} variant={'ghost'}>
              <ArrowBigUp size={24} />
            </Button>
            {optFeedback.votes}
            <Button onClick={() => handleUpdateVote(-1)} variant={'ghost'} size={'icon'}>
              <ArrowBigDown size={24} />
            </Button>
          </div>
        )}
      </div>
      {isExpanded && (
        <div className="mt-4 gap-4">
          <h3 className="text-sm my-4 font-semibold">Images</h3>
          <Suspense
            fallback={
              <div className="flex gap-3 rounded-md ">
                <Skeleton className="min-h-24 md:min-h-36 w-full rounded-md" />;
                <Skeleton className="min-h-24 md:min-h-36 w-full rounded-md" />;
                <Skeleton className="min-h-24 md:min-h-36 w-full rounded-md" />;
              </div>
            }
          >
            <div className="flex flex-row items-center gap-4">
              {feedbackImages &&
                feedbackImages?.map((image, i) => (
                  <PreviewImage
                    key={i}
                    image={image.signedUrl}
                    // handleImageRemove={() => handleImageRemove(i)}
                    lightBox
                    classNames="w-fit"
                  />
                ))}
            </div>
          </Suspense>
          <Form {...form}>
            <div className="flex flex-row items-center gap-4 mt-4">
              {imageUrls.map((image, i) => (
                <PreviewImage
                  key={i}
                  image={image}
                  handleImageRemove={() => handleImageRemove(i)}
                />
              ))}
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        style={{ display: 'none' }}
                        multiple
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                  {images.length > 0 && (
                    <LoadingButton
                      type="submit"
                      buttonState={buttonState}
                      text={'Submit'}
                      loadingText={'Submitting ...'}
                      successText="Submitted"
                    />
                  )}
                </div>
                <Button
                  variant={optFeedback.status === 1 ? 'outline' : 'default'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggleResolved();
                  }}
                >
                  {optFeedback.status === 1 ? 'Reinstate' : 'Mark resolved'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </Card>
  );
};

export default FeedbackCard;
