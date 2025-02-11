'use client';
import { PhraseWithTranslations } from 'kysely-codegen';
import React, { useState } from 'react';
import { useUserContext } from '@/contexts/user_context';
import { playSavedAudio } from '@/lib/helpers/helpersAudio';
import { createClient } from '@/utils/supabase/client';

import { AudioPlayButton } from '../ui/audio-play-button';
import BaseObjectCard from './base_object_card';
import RecordingCardDetails from './recording_card_details';

interface RecordingCardProps {
  phrase: PhraseWithTranslations;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ phrase }) => {
  const { userId } = useUserContext();
  const supabase = createClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioObject, setAudioObject] = useState<false | HTMLAudioElement | undefined>(undefined);
  const date = new Date(phrase.createdAt);

  const setIsPlayingFalse = () => {
    setIsPlaying(false);
  };

  const handlePlayClick = async () => {
    if (isPlaying && audioObject) {
      audioObject.pause();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    const audio = await playSavedAudio({
      supabase,
      bucket: 'user_recordings',
      fileName: `${userId}/${phrase.filename}`,
      setIsPlayingFalse,
    });
    setAudioObject(audio);
  };

  return (
    <BaseObjectCard
      withoutDetails={
        <AudioPlayButton
          handleClick={handlePlayClick}
          isPlaying={isPlaying}
          isLoading={false}
          exists={true}
        />
      }
      objectDetails={<RecordingCardDetails recording={phrase} userId={userId} />}
      text={phrase.text}
      date={date}
      phraseId={phrase.id}
      lang={phrase.lang}
    />
  );
};

export default RecordingCard;
