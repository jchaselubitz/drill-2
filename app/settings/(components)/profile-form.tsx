'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileWithMedia } from 'kysely-codegen';
import { CameraIcon, PenBoxIcon, Trash } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import UserImage from '@/components/user_image';
import { deleteProfileImage, uploadProfileImage } from '@/lib/actions/storageActions';
import { upsertProfile } from '@/lib/actions/userActions';
import { handleImageCompression } from '@/lib/helpers/helpersImages';

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  imageUrl: z.string().optional(),
  // bio: z.string().max(160).min(4),
  // urls: z
  //   .array(
  //     z.object({
  //       value: z.string().url({ message: 'Please enter a valid URL.' }),
  //     })
  //   )
  //   .optional(),
});

export function ProfileForm({ profile }: { profile: ProfileWithMedia | undefined }) {
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  // This can come from your database or API.
  const defaultValues: Partial<ProfileFormValues> = {
    name: profile?.username ?? '',
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files?.length ? Array.from(event.target.files) : null;
    if (files && files.length > 0) {
      files.map(async (file) => {
        try {
          const compressedFile = await handleImageCompression(file);
          if (!compressedFile) return;
          // const imageUrl = await fileToImageUrl(compressedFile);
          const fileFormData = new FormData();
          fileFormData.append('image', compressedFile);
          if (!profile) {
            alert('Please set your profile name first.');
            return;
          }
          const imageUrl = await uploadProfileImage({
            file: fileFormData,
            profileId: profile.id,
            fileName: compressedFile.name,
            oldImageUrl: profile.imageUrl,
          });
          upsertProfile({ name: profile.username, imageUrl });
        } catch (error) {
          throw new Error(`error uploading image: ${error}`);
        }
      });
    }
  };

  const handlePhotoButtonClick = () => {
    if (photoInputRef.current !== null) {
      photoInputRef.current.click();
    }
  };

  const handleImageDelete = async () => {
    if (!profile?.imageUrl) return;
    await deleteProfileImage({ profileId: profile.id, url: profile.imageUrl });
    await upsertProfile({ name: profile.username, imageUrl: null });
  };

  async function onSubmit(data: ProfileFormValues) {
    await upsertProfile({ name: data.name, imageUrl: profile?.imageUrl });
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col">
          {/* <div className=" rounded-full h-full w-fit">
            {profile?.imageUrl ? (
              <div className="relative">
                <div>
                  <UserImage
                    image={profile?.imageUrl}
                    classNames="rounded-full flex items-center justify-center overflow-clip w-36 h-36"
                  />
                </div>
                <div className="  absolute -bottom-4  w-full flex items-end justify-evenly">
                  <Button
                    variant="outline"
                    size="icon"
                    className="p-0 rounded-full  border-0"
                    onClick={handlePhotoButtonClick}
                  >
                    <PenBoxIcon className="w-8 h-8 text-black " />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="p-0 rounded-full border-0"
                    onClick={handleImageDelete}
                  >
                    <Trash className="w-8 h-8 text-red-800" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0 rounded-full  border-0"
                  onClick={handlePhotoButtonClick}
                >
                  <CameraIcon className="w-10 h-10" />
                </Button>
              </div>
            )}
          </div> */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl onChange={handleImageChange}>
                  <Input
                    {...field}
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    // capture="environment"
                    style={{ display: 'none' }}
                    multiple
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Darth Vader" {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Update profile</Button>
        </form>
      </Form>
    </div>
  );
}
