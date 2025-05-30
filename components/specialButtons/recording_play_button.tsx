import { BasePhrase } from 'kysely-codegen';
import React, { useState } from 'react';
import { useUserContext } from '@/contexts/user_context';
import { playSavedAudio } from '@/lib/helpers/helpersAudio';
import { createClient } from '@/utils/supabase/client';

import { AudioPlayButton } from '../ui/audio-play-button';

interface RecordingPlayButtonProps {
  phrase: BasePhrase;
}

const RecordingPlayButton: React.FC<RecordingPlayButtonProps> = ({ phrase }) => {
  const supabase = createClient();
  const { userId } = useUserContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioObject, setAudioObject] = useState<false | HTMLAudioElement | undefined>(undefined);

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
      bucket: 'user-recordings',
      fileName: `${userId}/${phrase.filename}`,
      setIsPlayingFalse,
    });
    setAudioObject(audio);
  };

  return (
    <AudioPlayButton
      handleClick={handlePlayClick}
      isPlaying={isPlaying}
      isLoading={false}
      exists={true}
    />
  );
};

export default RecordingPlayButton;
