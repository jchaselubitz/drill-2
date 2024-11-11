'use client';

import React, { useState } from 'react';

import { AudioPlayButton } from '../ui/audio-play-button';
import { createClient } from '@/utils/supabase/client';
import { getAudioFile, playSavedAudio } from '@/lib/helpers/helpersAudio';
import { hashString } from '@/lib/helpers/helpersDB';

interface TtsButtonProps {
  bucket: string;
  lacksAudio?: boolean;
  text: string | null;
}

const TtsButton: React.FC<TtsButtonProps> = ({ bucket, lacksAudio, text }) => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exists, setExists] = useState(!lacksAudio);
  const [audioObject, setAudioObject] = useState<HTMLAudioElement | null>(null);

  const handlePlaySpeech = async () => {
    if (!text) return;
    if (isPlaying) {
      audioObject?.pause();
      setIsPlaying(false);
      return;
    }

    const setIsPlayingFalse = () => setIsPlaying(false);
    const setIsLoadingFalse = () => setIsLoading(false);

    const fileName = (await hashString(text as string)) + '.mp3';
    const playedExistingFile = await playSavedAudio({
      fileName,
      supabase,
      bucket,
      setIsPlayingFalse,
    });

    if (playedExistingFile) {
      setIsPlaying(true);
      setAudioObject(playedExistingFile);
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);
    setExists(true);

    await getAudioFile({
      text,
      fileName,
      supabase,
      bucket,
      playAfterSave: true,
      setIsPlayingFalse,
      setIsLoadingFalse,
    });
  };

  return (
    <AudioPlayButton
      exists={exists}
      isLoading={isLoading}
      isPlaying={isPlaying}
      handleClick={handlePlaySpeech}
    />
  );
};

export default TtsButton;
