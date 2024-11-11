'use client';
import React, { useState } from 'react';

import PhraseCardDetails from './phrase_card_details';
import TtsButton from '../ai_elements/tts_button';
import { cn } from '@/lib/utils';
import { PhraseWithTranslations } from 'kysely-codegen';

interface PhraseCardProps {
  phrase: PhraseWithTranslations;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ phrase }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const bucket = 'text_to_speech';

  return (
    <div
      className={cn(
        'rounded-lg w-full',
        'hover:bg-gray-200 hover:shadow-sm focus:bg-slate-300 transition-colors duration-200 ease-in-out',
        'bg-gray-100'
      )}
    >
      <div className="p-4 w-full" onClick={() => setDetailsOpen(!detailsOpen)} tabIndex={0}>
        <div className="flex justify-between gap-2 text-left items-center">
          <h3>{phrase.text}</h3>
          <div className="w-12">
            <TtsButton text={phrase.text} bucket={bucket} lacksAudio={false} />
          </div>
        </div>
      </div>
      {detailsOpen && (
        <div className="p-4">
          <PhraseCardDetails phrase={phrase} />
        </div>
      )}
    </div>
  );
};

export default PhraseCard;
