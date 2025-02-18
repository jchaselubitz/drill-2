import audioBufferToWav from 'audiobuffer-to-wav';
import React, { useRef, useState } from 'react';

import { Button } from '../ui/button';
import { LoadingButton } from '../ui/button-loading';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const TrimAudio: React.FC<{
  maxDuration: number;
  maxDurationMinutes: number;
  audioResponse: { blob: Blob; url: string };
  setAudioResponse: (audioResponse: { blob: Blob; url: string }) => void;
  audioDuration: number;
}> = ({ maxDuration, maxDurationMinutes, audioResponse, setAudioResponse, audioDuration }) => {
  const secondsToClock = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const clockToSeconds = (clock: string) => {
    const [minutes, seconds] = clock.split(':').map(Number);
    return minutes * 60 + seconds;
  };
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(audioDuration);
  const [isTrimming, setIsTrimming] = useState(false);
  const [newAudioBlob, setNewAudioBlob] = useState<Blob | null>(null);
  const [newAudioURL, setNewAudioURL] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const origAudioBlob = audioResponse?.blob ?? null;

  const newAudioDuration = endTime - startTime;

  const closeModal = () => {
    setOpen(false);
  };

  const validateTime = () => {
    const startClockSplit = secondsToClock(startTime).split(':');
    const endClockSplit = secondsToClock(endTime).split(':');
    if (
      !secondsToClock(startTime).includes(':') ||
      startClockSplit.length !== 2 ||
      !secondsToClock(endTime).includes(':') ||
      endClockSplit.length !== 2 ||
      startClockSplit[1].length > 2 ||
      endClockSplit[1].length > 2
    ) {
      alert('Please enter a valid time in the format mm:ss');
      return false;
    }

    if (startTime > endTime) {
      alert('Start time cannot be greater than end time');
      return false;
    }

    if (endTime - startTime > maxDuration) {
      alert(`Trimmed audio cannot exceed ${maxDuration} minutes`);
      return false;
    }
    return true;
  };

  const trimAudioBlob = async () => {
    const audioContext = new (window.AudioContext || window.AudioContext)();
    const arrayBuffer = await origAudioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    if (endTime === 0 || endTime > audioBuffer.duration) {
      setEndTime(audioBuffer.duration);
    }

    const startFrame = Math.round(startTime * audioBuffer.sampleRate);
    const endFrame = Math.round(endTime * audioBuffer.sampleRate);

    const trimmedAudioBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      endFrame - startFrame,
      audioBuffer.sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const trimmingData = audioBuffer.getChannelData(channel).slice(startFrame, endFrame);
      trimmedAudioBuffer.copyToChannel(trimmingData, channel);
    }

    const wavArrayBuffer = audioBufferToWav(trimmedAudioBuffer);
    const trimmedAudioBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });

    return trimmedAudioBlob;
  };

  const handleTrim = async () => {
    if (!validateTime()) return;
    setIsTrimming(true);
    const trimmedAudioBlob = await trimAudioBlob();
    setNewAudioBlob(trimmedAudioBlob);
    setNewAudioURL(URL.createObjectURL(trimmedAudioBlob));
    setIsTrimming(false);
  };

  const handleSubmit = () => {
    setAudioResponse({ blob: newAudioBlob as Blob, url: newAudioURL as string });
    closeModal();
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button
          variant={'ghost'}
          size="icon"
          className="w-full  border border-gray-700"
          onClick={() => setOpen(true)}
        >
          Trim
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px] md:top-[20%]">
        <DialogTitle hidden>Trim Audio</DialogTitle>

        <div className="rounded-lg  mx-auto bg-white w-full  flex flex-col gap-2" ref={modalRef}>
          {newAudioURL && <audio src={newAudioURL} controls />}
          <div className="flex flex-row gap-3 items-center">
            <Label>Start:</Label>
            <Input
              className="rounded-md w-20"
              type="text"
              min="0"
              defaultValue={secondsToClock(startTime)}
              onBlur={(e) => setStartTime(clockToSeconds(e.target.value))}
            />

            <Label>End:</Label>
            <Input
              className="rounded-md w-20"
              type="text"
              min="0"
              defaultValue={secondsToClock(endTime)}
              onBlur={(e) => setEndTime(clockToSeconds(e.target.value))}
            />
          </div>
          <div className="flex flex-row gap-3 items-center mt-2">
            <LoadingButton
              className="bg-blue-600 rounded-lg text-white p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isTrimming || Math.floor(audioDuration) === newAudioDuration}
              buttonState={isTrimming ? 'loading' : 'default'}
              text={'Trim'}
              loadingText="Trimming..."
              onClick={handleTrim}
            />
            <LoadingButton
              className="bg-blue-600 rounded-lg text-white p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newAudioURL}
              buttonState={'default'}
              text={'Save'}
              loadingText="Saving..."
              onClick={handleSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrimAudio;
