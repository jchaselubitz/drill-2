'use client';

import { TrashIcon } from '@radix-ui/react-icons';
import React, { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Skeleton } from '../ui/skeleton';

interface PreviewImageProps {
  classNames?: string;
  round?: boolean;
  image: string;
  handleImageRemove?: () => void;
  lightBox?: boolean;
}

const PreviewImage: FC<PreviewImageProps> = ({
  classNames,
  image,
  lightBox,
  round,
  handleImageRemove,
}) => {
  const [showLightbox, setShowLightbox] = useState(false);

  const toggleLightBox = () => {
    if (lightBox) {
      setShowLightbox(!showLightbox);
    }
  };

  return (
    <div
      className={cn(classNames, 'relative shadow-lg border', round ? 'rounded-full' : 'rounded-md')}
      onClick={toggleLightBox}
    >
      <img
        src={image}
        className={cn(
          round && 'rounded-full',
          'max-h-36 md:max-h-48 hover:scale-105 transition-transform duration-300'
        )}
      />
      {handleImageRemove && (
        <Button
          variant="outline"
          size="icon"
          className={cn('rounded-full h-8 w-8 absolute top-0 right-0 bg-red-700')}
          onClick={handleImageRemove}
        >
          <TrashIcon className={cn('w-4 h-4', 'text-white')} />
        </Button>
      )}

      <div
        className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-50 flex items-center justify-center ${
          showLightbox ? 'block' : 'hidden'
        }`}
        onClick={toggleLightBox}
      >
        <img src={image} className="max-w-full max-h-full" />
      </div>
    </div>
  );
};

export default PreviewImage;

export const PreviewImageSkeleton: FC = () => {
  return <Skeleton className="min-h-24 md:min-h-36 w-full rounded-md" />;
};
