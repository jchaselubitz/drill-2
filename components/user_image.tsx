'use client';

import React, { FC, useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

interface UserImageProps {
  classNames?: string;
  image: string;
  lightBox?: boolean;
}

const UserImage: FC<UserImageProps> = ({ classNames, image, lightBox }) => {
  const [showLightbox, setShowLightbox] = useState(false);

  const toggleLightBox = () => {
    if (lightBox) {
      setShowLightbox(!showLightbox);
    }
  };

  return (
    <div
      className={cn(classNames, 'relative shadow-lg border rounded-full')}
      onClick={toggleLightBox}
    >
      <AspectRatio ratio={1}>
        <img src={image} className="h-full w-full rounded-md object-cover" />
      </AspectRatio>
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

export default UserImage;
