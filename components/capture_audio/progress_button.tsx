import { cn } from '@/lib/utils';
import React from 'react';

interface ProgressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  progress: number;
  size?: number;
  children: React.ReactNode;
  className?: string;
}

const ProgressButton: React.FC<ProgressButtonProps> = ({
  progress,
  size = 44,
  children,
  className = '',
  ...buttonProps
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-block z-10" style={{ width: size, height: size }}>
      {progress > 0 && progress < 100 && (
        <svg
          width={size}
          height={size}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s linear' }}
          />
        </svg>
      )}
      <button
        className={cn(
          `flex items-center justify-center rounded-full border border-gray-700 bg-white w-full h-full p-0`,
          className
        )}
        style={{ position: 'relative', zIndex: 0, width: size, height: size }}
        {...buttonProps}
      >
        {children}
      </button>
    </div>
  );
};

export default ProgressButton;
