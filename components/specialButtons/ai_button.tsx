import { Stars } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function AIButton({ onClick, children = 'Discuss in chat', className = '' }: AIButtonProps) {
  return (
    <Button
      className={`bg-gradient-to-r from-blue-600 to-cyan-600 text-white w-fit flex gap-2 ${className}`}
      onClick={onClick}
    >
      <Stars /> {children}
    </Button>
  );
}
