'use client';

import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  classNames?: string;
  showLabel?: boolean;
}

const BackButton: FC<BackButtonProps> = ({ classNames, showLabel }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        classNames,
        ' p-2 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex ml-1 md:ml-0 pl-1 md:pl-2 items-center group text-sm'
      )}
    >
      <ChevronLeft size={26} />
      {showLabel && <span className="hidden md:flex">Back</span>}
    </button>
  );
};

export default BackButton;
