import React, { useState } from 'react';
import { getLangIcon } from '@/lib/lists';

import { Button } from '../ui/button';

interface SaveTranslationButtonProps {
  output_text: string | null;
  output_lang: string;
  input_text: string | null;
  input_lang: string;
  saveTranslation: () => Promise<void>;
}

const SaveTranslationButton: React.FC<SaveTranslationButtonProps> = ({
  output_text,
  output_lang,
  input_text,
  input_lang,
  saveTranslation,
}) => {
  const [saved, setSaved] = useState(false);

  const handleSaveTranslation = async () => {
    await saveTranslation();
    setSaved(true);
  };

  return (
    <div className="flex items-center justify-between border border-gray-300 rounded p-2 hover:bg-gray-100">
      <span>
        {getLangIcon(output_lang)}: {output_text}
      </span>
      <span>
        {getLangIcon(input_lang)}: {input_text}
      </span>
      <Button disabled={saved} onClick={handleSaveTranslation}>
        {saved ? 'Saved' : 'Save Translation'}
      </Button>
    </div>
  );
};

export default SaveTranslationButton;
