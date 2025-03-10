import React from 'react';
import { Button } from '@/components/ui/button';

type SSOButtonProps = {
  iconPath: string;
  text: string;
  textColor: string;
  backgroundColor: string;
  onClick: () => void;
};

const SSOButton: React.FC<SSOButtonProps> = ({
  iconPath,
  text,
  backgroundColor,
  textColor,
  onClick,
}) => {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => onClick()}
      className="justify-center gap-4 font-medium hover:opacity-90"
      style={{ backgroundColor, color: textColor }}
    >
      <img src={iconPath} alt={'Slack Logo'} className="flex h-6" /> {text}
    </Button>
  );
};

export default SSOButton;
