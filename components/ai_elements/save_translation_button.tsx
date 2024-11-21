import React, { useState } from 'react';
import { getLangIcon } from '@/lib/lists';

import { ButtonLoadingState, LoadingButton } from '../ui/button-loading';

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
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');

  const handleSaveTranslation = async () => {
    try {
      setButtonState('loading');
      await saveTranslation();
      setButtonState('success');
    } catch (error) {
      setButtonState('error');
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-300 rounded p-2 hover:bg-gray-100 gap-2 ">
      <div className="flex gap-2">
        <span>
          {getLangIcon(output_lang)}: {output_text}
        </span>
        <span>
          {getLangIcon(input_lang)}: {input_text}
        </span>
      </div>
      <LoadingButton
        disabled={buttonState === 'loading' || buttonState === 'success'}
        size="sm"
        onClick={handleSaveTranslation}
        buttonState={buttonState}
        text={'Save Translation'}
        loadingText={'Saving ...'}
        successText="Saved"
      />
    </div>
  );
};

export default SaveTranslationButton;
