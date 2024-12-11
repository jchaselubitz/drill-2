import { X } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface TagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, onRemove, className = '' }) => {
  return (
    <div
      className={cn(
        `flex items-center gap-1 pr-3 py-1  text-xs  text-gray-100 bg-gray-800 rounded-full text-nowrap ${className}`,
        onRemove ? 'pl-0.5 ' : 'pl-2'
      )}
    >
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 rounded-full  hover:bg-gray-300 transition-colors"
          aria-label="Remove tag"
        >
          <X size={14} />
        </button>
      )}
      <span>{label}</span>
    </div>
  );
};

export default Tag;
