'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { removeFromHistory } from '@/lib/actions/phraseActions';
import { HistoryVocabType } from '@/lib/helpers/helpersAI';
import { capitalizeFirstLetter } from '@/lib/helpers/helpersPhrase';

import { Button } from '../ui/button';

interface HistoryPhraseItemProps {
  word: HistoryVocabType;
}

const HistoryPhraseItem: React.FC<HistoryPhraseItemProps> = ({ word }) => {
  const handleRemove = () => {
    if (word.id) removeFromHistory(word.id);
  };
  return (
    <div className="flex justify-between items-center font-semibold border px-3 py-2 gap-4 rounded-md">
      <div>
        <div className="font-semibold">{capitalizeFirstLetter(word.text)}</div>
        <div className="text-xs text-zinc-600">
          {word.partSpeech} | Difficulty: {word.difficulty}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant={'outline'} size={'sm'} onClick={handleRemove}>
          Remove from history
        </Button>
        <Link href={`/library?phrase=${word.id}`}>
          <Button variant={'outline'} size={'sm'}>
            Library <ChevronRight />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HistoryPhraseItem;
