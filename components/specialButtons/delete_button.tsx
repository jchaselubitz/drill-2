import { Loader2Icon, TrashIcon } from 'lucide-react';
import React from 'react';

export interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  onClick: () => void;
}

const DeleteButton = React.forwardRef<HTMLButtonElement, DeleteButtonProps>(
  ({ onClick, isLoading, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      confirm('Are you sure you want to delete this phrase?') && onClick();
    };

    return (
      <button ref={ref} {...props} onClick={handleClick} className="text-red-700">
        {!isLoading ? <TrashIcon size={18} /> : <Loader2Icon size={18} className="animate-spin" />}
      </button>
    );
  }
);

export default DeleteButton;
