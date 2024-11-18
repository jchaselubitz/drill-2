import React from 'react';
import { X } from 'lucide-react';

interface TagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, onRemove, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 pr-3 py-1 text-sm  text-gray-100 bg-gray-800 rounded-full ${className}`}
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
