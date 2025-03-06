import React, { useRef, useState } from 'react';
import { trimAudioBlob } from '@/lib/helpers/helpersAudio';

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

  const handleTrim = async () => {
    if (!validateTime()) return;
    setIsTrimming(true);
    const trimmedAudioBlob = await trimAudioBlob({
      origAudioBlob: origAudioBlob,
      startTime,
      endTime,
    });
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
          className="w-full md:w-fit  border border-gray-700"
          onClick={() => setOpen(true)}
        >
          Trim
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px] md:top-[20%]">
        <DialogTitle hidden>Trim Audio</DialogTitle>

        <div
          className="rounded-lg  mx-auto bg-white w-full  flex flex-col gap-4 mt-4"
          ref={modalRef}
        >
          {newAudioURL && <audio src={newAudioURL} controls style={{ width: '100%' }} />}
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
