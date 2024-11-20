'use client';
import { playSavedAudio } from '@/lib/helpers/helpersAudio';
import { BaseRecording } from 'kysely-codegen';
import React, { useState } from 'react';
import { AudioPlayButton } from '../ui/audio-play-button';
import RecordingCardDetails from './recording_card_details';
import { useUserContext } from '@/contexts/user_context';
import { createClient } from '@/utils/supabase/client';
import BaseObjectCard from './base_object_card';

interface RecordingCardProps {
  recording: BaseRecording;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ recording }) => {
  const { userId } = useUserContext();
  const supabase = createClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioObject, setAudioObject] = useState<false | HTMLAudioElement | undefined>(undefined);

  const date = new Date(recording.createdAt);

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
      fileName: `${userId}/${recording.filename}`,
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
      objectDetails={
        <RecordingCardDetails
          recording={recording}
          userId={userId}
          handlePlayClick={handlePlayClick}
          isPlaying={isPlaying}
        />
      }
      text={recording.transcript}
      date={date}
    />
  );
};

export default RecordingCard;
