import type { SupabaseClient } from '@supabase/supabase-js';
import { getOpenAiKey } from './helpersAI';
import { Mp3Encoder } from '@breezystack/lamejs';
import audioBufferToWav from 'audiobuffer-to-wav';
import * as Sentry from '@sentry/nextjs';
const tus = require('tus-js-client');

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
  setUploadProgress?: (progress: number) => void;
};

export async function savePrivateAudioFile({
  fileName,
  path,
  supabase,
  bucketName,
  audioFile,
  setIsloadingFalse,
  setUploadProgress,
}: SaveAudioFileProps) {
  const projectURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const endpoint = `${projectURL}/storage/v1/upload/resumable`;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const file = new File([audioFile], fileName, { type: 'audio/mpeg' });
  try {
    new Promise<void>(async (resolve, reject) => {
      var upload = new tus.Upload(file, {
        endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token}`,
          'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
        metadata: {
          bucketName: bucketName,
          objectName: `${path}/${fileName}`,
          contentType: 'image/png',
          cacheControl: 3600,
        },
        chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
        onError: function (error: any) {
          console.log('Failed because: ' + error);
          reject(error);
        },
        onProgress: function (bytesUploaded: number, bytesTotal: number) {
          var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setUploadProgress && setUploadProgress(Number(percentage));
          console.log(bytesUploaded, bytesTotal, percentage + '%');
        },
        onSuccess: function () {
          // console.log('Download %s from %s', upload.file.name, upload.url);
          resolve();
        },
      });
      // Check if there are any previous uploads to continue.
      return upload.findPreviousUploads().then(function (previousUploads: any) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        // Start the upload
        upload.start();
      });
    });
  } catch (error) {
    setIsloadingFalse && setIsloadingFalse();
    console.log('error', error);
    Sentry.captureException(error);
  }

  // const { data, error } = await supabase.storage
  //   .from(bucketName)
  //   .upload(`${path}/${fileName}`, audioFile);

  // if (error) {
  //   setIsloadingFalse && setIsloadingFalse();
  //   throw error;
  // }
  // return data;
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

// export async function compressAudio(file: File): Promise<Blob> {
//   const formData = new FormData();
//   formData.append('audio', file);

//   const response = await fetch('https://audio-service-production.up.railway.app/compress', {
//     method: 'POST',
//     body: formData,
//   });

//   if (!response.ok) {
//     throw new Error('Compression failed');
//   }

//   // We'll receive an MP3 file as the response
//   const blob = await response.blob();
//   return blob;
// }

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
  const mp3Data: Uint8Array[] = [];

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
        mp3Data.push(new Uint8Array(mp3buf));
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
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }
  }

  const endBuf = mp3encoder.flush();
  if (endBuf.length > 0) {
    mp3Data.push(new Uint8Array(endBuf));
  }

  return new Blob(mp3Data, { type: 'audio/mpeg' });
}

export const trimAudioBlob = async ({
  origAudioBlob,
  startTime,
  endTime,
}: {
  origAudioBlob: Blob;
  startTime: number;
  endTime: number;
}) => {
  const arrayBuffer = await origAudioBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  if (endTime === 0 || endTime > audioBuffer.duration) {
    endTime = audioBuffer.duration;
  }

  const startFrame = Math.round(startTime * audioBuffer.sampleRate);
  const endFrame = Math.round(endTime * audioBuffer.sampleRate);
  const duration = endFrame - startFrame;

  // Use OfflineAudioContext to process only the trimmed part
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    duration,
    audioBuffer.sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0, startTime, endTime - startTime);

  const renderedBuffer = await offlineContext.startRendering();

  // Convert to Blob (as WAV)
  const wavArrayBuffer = audioBufferToWav(renderedBuffer);
  return new Blob([wavArrayBuffer], { type: 'audio/wav' });
};
