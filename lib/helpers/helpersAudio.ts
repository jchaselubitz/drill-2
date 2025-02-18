import type { SupabaseClient } from '@supabase/supabase-js';
import { getOpenAiKey } from './helpersAI';
import { Mp3Encoder } from '@breezystack/lamejs';

export type GetTextFromSpeechProps = {
  audioFile: Blob;
  setIsloadingFalse: () => void;
};

export type SavedAudio = {
  fileName: string;
  supabase: SupabaseClient<any, 'public', any>;
  bucket: string;
};
export type PlaySavedAudio = SavedAudio & {
  setIsPlayingFalse?: () => void;
};

export type GetAudioFileProps = PlaySavedAudio & {
  text: string;
  playAfterSave?: boolean | undefined;
  setIsLoadingFalse: () => void;
};

export async function getFileList({
  supabase,
  bucket,
}: {
  supabase: SupabaseClient<any, 'public', any>;
  bucket: string;
}) {
  const { data: files, error } = await supabase.storage.from(bucket).list();
  if (error) {
    throw error;
  }
  return files;
}

export async function getAudioFile({
  text,
  fileName,
  supabase,
  bucket,
  playAfterSave,
  setIsPlayingFalse,
  setIsLoadingFalse,
}: GetAudioFileProps) {
  if (playAfterSave && !setIsPlayingFalse) {
    throw new Error('playAfterSave requires setIsPlayingFalse to be defined.');
  }

  const { data, error } = await supabase.functions.invoke('text-to-speech', {
    body: {
      userApiKey: getOpenAiKey(),
      text,
      fileName,
    },
  });
  if (error) {
    console.log('Error:', error);
    return;
  }

  if (data) {
    setIsLoadingFalse();
    playAfterSave && playSavedAudio({ fileName: data.path, supabase, bucket, setIsPlayingFalse });

    return data;
  }
}

export async function checkIfAudioExists({ fileName, supabase, bucket }: SavedAudio) {
  const { data: existingFile, error: existingError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(fileName, 1);

  if (existingError) {
    return false;
  }

  if (existingFile) {
    return true;
  }
  return false;
}

export async function playSavedAudio({
  fileName,
  supabase,
  bucket,
  setIsPlayingFalse,
}: PlaySavedAudio) {
  const { data: existingFile, error: existingError } = await supabase.storage
    .from(bucket)
    .download(fileName);

  if (existingError) {
    setIsPlayingFalse && setIsPlayingFalse();
    return;
  }

  if (existingFile) {
    const audioBlob = new Blob([existingFile], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audio.play().catch((e) => {
      console.error('Error playing audio:', e);
    });

    audio.onended = () => {
      URL.revokeObjectURL(url);
      setIsPlayingFalse && setIsPlayingFalse();
    };

    return audio;
  }
  return false;
}

export type SaveAudioFileProps = {
  audioFile: Blob;
  fileName: string;
  path: string;
  supabase: SupabaseClient<any, 'public', any>;
  bucketName: string;
  setIsloadingFalse?: () => void;
};

export async function savePrivateAudioFile({
  fileName,
  path,
  supabase,
  bucketName,
  audioFile,
  setIsloadingFalse,
}: SaveAudioFileProps) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(`${path}/${fileName}`, audioFile);

  if (error) {
    setIsloadingFalse && setIsloadingFalse();
    throw error;
  }
  return data;
}

export interface RecordAudioResult {
  start: () => void;
  stop: () => Promise<{ blob: Blob; url: string }>;
}

export function recordAudio() {
  return new Promise<RecordAudioResult>((resolve) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // const options = { mimeType: 'audio/mpeg' };
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      const start = () => {
        mediaRecorder.start(1000);
      };

      const stop = () => {
        return new Promise<{ blob: Blob; url: string }>((resolve) => {
          mediaRecorder.addEventListener('stop', () => {
            const blob = new Blob(audioChunks, { type: 'audio/mp4' });
            const url = URL.createObjectURL(blob);
            stream.getTracks().forEach((track) => track.stop());
            resolve({ blob, url });
          });

          mediaRecorder.stop();
        });
      };

      resolve({ start, stop });
    });
  });
}

export async function compressAudio(file: File, targetBitrate: number = 64): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('Audio compression can only be done in browser');
  }

  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const blockSize = 1152;
  const mp3Data: Int8Array[] = [];

  const floatTo16BitPCM = (input: Float32Array): Int16Array => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  };

  const channelData: Int16Array[] = [];
  for (let ch = 0; ch < channels; ch++) {
    channelData.push(floatTo16BitPCM(audioBuffer.getChannelData(ch)));
  }

  const mp3encoder = new Mp3Encoder(channels, sampleRate, targetBitrate);

  if (channels === 1) {
    const samples = channelData[0];
    for (let i = 0; i < samples.length; i += blockSize) {
      const sampleChunk = samples.subarray(i, i + blockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
      }
    }
  } else {
    const left = channelData[0];
    const right = channelData[1];
    for (let i = 0; i < left.length; i += blockSize) {
      const leftChunk = left.subarray(i, i + blockSize);
      const rightChunk = right.subarray(i, i + blockSize);
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
      }
    }
  }

  const endBuf = mp3encoder.flush();
  if (endBuf.length > 0) {
    mp3Data.push(new Int8Array(endBuf));
  }

  return new Blob(mp3Data, { type: 'audio/mpeg' });
}
