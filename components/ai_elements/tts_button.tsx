'use client';

import React, { useState } from 'react';
import { getAudioFile, playSavedAudio } from '@/lib/helpers/helpersAudio';
import { hashString } from '@/lib/helpers/helpersDB';
import { createClient } from '@/utils/supabase/client';

import { AudioPlayButton } from '../ui/audio-play-button';

interface TtsButtonProps {
  bucket: string;
  lacksAudio: boolean | undefined;
  text: string | null;
  className?: string;
}

const TtsButton: React.FC<TtsButtonProps> = ({ bucket, lacksAudio, text, className }) => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioObject, setAudioObject] = useState<HTMLAudioElement | null>(null);
  const [exists, setExists] = useState<boolean | undefined>(!lacksAudio);

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
      className={className}
    />
  );
};

export default TtsButton;
