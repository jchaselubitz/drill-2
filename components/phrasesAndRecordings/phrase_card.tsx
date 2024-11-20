'use client';
import { PhraseWithTranslations } from 'kysely-codegen';
import React from 'react';
import TtsButton from '../ai_elements/tts_button';
import PhraseCardDetails from './phrase_card_details';
import BaseObjectCard from './base_object_card';

interface PhraseCardProps {
  phrase: PhraseWithTranslations;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ phrase }) => {
  const bucket = 'text_to_speech';

  return (
    <BaseObjectCard
      withoutDetails={<TtsButton text={phrase.text} bucket={bucket} lacksAudio={false} />}
      objectDetails={<PhraseCardDetails phrase={phrase} />}
      text={phrase.text}
      date={phrase.createdAt}
    />
  );
};

export default PhraseCard;
