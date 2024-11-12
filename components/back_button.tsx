'use client';

import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';

interface BackButtonProps {
  classNames?: string;
  showLabel?: boolean;
}

const BackButton: FC<BackButtonProps> = ({ classNames, showLabel }) => {
  const router = useRouter();

  return (
    <Button
      variant="link"
      onClick={() => router.back()}
      className={cn(
        classNames,
        'py-2 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex ml-1 md:ml-0 pl-1 md:pl-2 items-center group text-sm'
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2 h-6 w-6 md:h-4 md:w-4 transition-transform group-hover:-translate-x-1"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {showLabel && <span className="hidden md:flex">Back</span>}
    </Button>
  );
};

export default BackButton;
