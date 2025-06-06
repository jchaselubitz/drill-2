'use client';
import { PhraseWithAssociations } from 'kysely-codegen';
import { useRouter } from 'next/navigation';
import React from 'react';

import TtsButton from '../ai_elements/tts_button';
import BaseObjectCard from './base_object_card';
import PhraseDetails from './phrase_details';

interface PhraseCardProps {
  phrase: PhraseWithAssociations;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ phrase }) => {
  const bucket = 'text-to-speech';
  const router = useRouter();

  const setSelectedPhrase = (id: string) => {
    router.push(`/library?phrase=${id}`);
  };

  return (
    <BaseObjectCard
      withoutDetails={<TtsButton text={phrase.text} bucket={bucket} lacksAudio={false} />}
      objectDetails={<PhraseDetails phrase={phrase} navigateToPhrase={setSelectedPhrase} />}
      text={phrase.text}
      date={phrase.createdAt}
      phraseId={phrase.id}
      lang={phrase.lang}
    />
  );
};

export default PhraseCard;
