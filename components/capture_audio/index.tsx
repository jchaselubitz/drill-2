'use client';

import { Iso639LanguageCode } from 'kysely-codegen';
import { Languages, Stars } from 'lucide-react';
import React, { FC, useState, useRef, useEffect } from 'react';
import { useUserContext } from '@/contexts/user_context';
import { addPhrase } from '@/lib/actions/phraseActions';
import { LangCheckStructure } from '@/lib/aiGenerators/types_generation';
import {
  compressAudio,
  recordAudio,
  RecordAudioResult,
  savePrivateAudioFile,
} from '@/lib/helpers/helpersAudio';
import { createClient } from '@/utils/supabase/client';
import LanguageMenu from '../selectors/language_selector';
import { ButtonLoadingState } from '../ui/button-loading';
import ImportPodcast from './import_podcast';
import MediaReview from './media_review';
import RecordButton, { RecordButtonStateType } from './record_button';
import UploadButton from './upload_button';
import * as Sentry from '@sentry/nextjs';
import { getLangValue, getLangName } from '@/lib/lists';

type AudioResponse = {
  blob: Blob;
  url: string;
};

const CaptureAudio: FC = () => {
  const { userId, prefLanguage } = useUserContext();
  const supabase = createClient();

  const [transcriptButtonState, setTranscriptionLoading] = useState<ButtonLoadingState>('default');
  const [transcript, setTranscript] = useState<{
    text: string;
    language: Iso639LanguageCode | null;
  }>({
    text: '',
    language: null,
  });
  const [recordingButtonState, setRecordingButtonState] = useState<RecordButtonStateType>('idle');
  const [recordingState, setRecordingState] = useState<RecordAudioResult | null>(null);
  const [audioResponse, setAudioResponse] = useState<AudioResponse | undefined | null>(null);
  const [selectedLang, setSelectedLang] = useState<Iso639LanguageCode | '' | 'auto'>('');

  const [saveButtonState, setSaveButtonState] = useState<ButtonLoadingState>('default');
  const [saveTranscriptButtonState, setSaveTranscriptButtonState] =
    useState<ButtonLoadingState>('default');
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [importingPodcast, setImportingPodcast] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [importProgress, setImportProgress] = useState<number>(0); // 0 to 100

  const resetRecordingButtonState = () => {
    setRecordingButtonState('idle');
    setRecordingState(null);
    setTranscriptionLoading('default');
    setTranscript({ text: '', language: null });
    setSaveButtonState('default');
    setSaveTranscriptButtonState('default');
    setImportingPodcast(false);
    setAudioResponse(null);
    URL.revokeObjectURL(audioResponse?.url as string);
  };

  const startRecording = async () => {
    setAudioResponse(null);
    const recording = await recordAudio();
    if (recordingButtonState === 'idle') {
      setRecordingButtonState('recording');
      recording.start();
    }
    setRecordingState(recording);
  };

  const stopRecording = async () => {
    const response = await recordingState?.stop();
    setRecordingButtonState('idle');
    setAudioResponse(response);
  };

  const handleUpload = async (file: File) => {
    resetRecordingButtonState();
    setRecordingButtonState('disabled');
    const audioBlob = new Blob([file], { type: 'audio/mp4' });
    const url = URL.createObjectURL(audioBlob);
    setAudioResponse({ blob: audioBlob, url: url });
  };

  const importPodcast = async (url: string) => {
    setTranscript({ text: '', language: null });
    setImportingPodcast(true);
    setAudioResponse(null);
    setImportProgress(5); // Started
    try {
      setRecordingButtonState('disabled');
      setImportProgress(10); // Fetching
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentLength = response.headers.get('content-length');
      if (!contentLength || !response.body) {
        // fallback to old method if content-length is not provided or body is null
        setImportProgress(11); // Downloading
        const arrayBuffer = await response.arrayBuffer();
        setImportProgress(90); // Processing
        const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioResponse({ blob: audioBlob, url: audioURL });
        setImportProgress(100); // Done
        return;
      }

      setImportProgress(30); // Start streaming
      const total = parseInt(contentLength, 10);
      let loaded = 0;
      const reader = response.body.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        setImportProgress(Math.min(99, Math.round((loaded / total) * 100)));
      }
      setImportProgress(99); // Finalizing
      const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioResponse({ blob: audioBlob, url: audioURL });
      setImportProgress(100); // Done
    } catch (error: any) {
      setImportProgress(0); // Reset on error
      throw new Error('Error processing podcast: ' + error.message);
    } finally {
      setRecordingButtonState('idle');
      setImportingPodcast(false);
    }
  };

  const transcribeRecording = async () => {
    setRecordingButtonState('transcribing');
    setTranscriptionLoading('loading');

    if (!audioResponse) {
      throw Error('No audio response to transcribe');
    }
    const audioFile = new File([audioResponse.blob], 'podcast.mp3', { type: 'audio/mpeg' });
    const compressedBlob = await compressAudio(audioFile);
    const formData = new FormData();
    formData.append('audioFile', compressedBlob, 'recording.mp4');
    const { data: transcription, error } = await supabase.functions.invoke('speech-to-text', {
      body: formData,
    });
    if (error) {
      setTranscriptionLoading('error');
      throw Error(`Error transcribing recording: ${error}`);
    }
    setTranscriptionLoading('success');
    setRecordingButtonState('disabled');

    if (transcription.language) {
      // setSelectedLang(getLangValue(transcription.language) as Iso639LanguageCode);
      setTranscript({
        text: transcription.text,
        language: getLangValue(transcription.language) as Iso639LanguageCode,
      });
    }
  };

  const saveTranscript = async (fileName?: string) => {
    setSaveTranscriptButtonState('loading');
    const useAuto = selectedLang === '' || selectedLang === 'auto';
    const lang = !useAuto ? selectedLang : (transcript.language ?? prefLanguage);

    if (!lang) {
      setSaveTranscriptButtonState('error');
      alert('Could not determine language');
      return;
    }

    try {
      await addPhrase({
        text: transcript.text,
        filename: fileName ?? null,
        lang,
        type: 'recording',
        source: 'home',
      });
      setSaveTranscriptButtonState('success');
      return;
    } catch (error) {
      setSaveTranscriptButtonState('error');
      if (error instanceof Error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          setSaveTranscriptButtonState('success');
          alert('You have already saved this phrase');
          return;
        }
        Sentry.captureException(error);
      }
      throw Error(`Error saving recording: ${error}`);
    } finally {
      resetRecordingButtonState();
    }
  };

  const saveRecording = async () => {
    setSaveButtonState('loading');
    const fileName = `${Date.now()}-recording`;
    const bucketName = 'user-recordings';
    if (audioResponse) {
      const audioFile = new File([audioResponse.blob], 'podcast.mp3', { type: 'audio/mpeg' });
      const compressedBlob = await compressAudio(audioFile);

      await savePrivateAudioFile({
        fileName,
        path: userId as string,
        supabase: supabase,
        bucketName,
        audioFile: compressedBlob,
        setUploadProgress,
      });
    }
    await saveTranscript(fileName);
  };

  const handleClick = () => {
    if (recordingButtonState === 'disabled') {
      return;
    }
    if (recordingButtonState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleLangSelection = ({ lang }: { lang: Iso639LanguageCode; name: string }) => {
    setSelectedLang(lang);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-center items-center gap-3 mb-2 w-full">
        <ImportPodcast importPodcast={importPodcast} progress={importProgress} />
        <UploadButton handleUpload={handleUpload} />
        <RecordButton recordingButtonState={recordingButtonState} handleClick={handleClick} />

        <LanguageMenu
          props={{
            icon: Languages,
            label: <Stars />,
            name: '',
            language: selectedLang,
          }}
          iconOnly
          automaticOption
          onClick={handleLangSelection}
        />
      </div>
      {/* {importingPodcast && (
        <div className="w-full flex flex-col items-center my-2">
          <Progress
            value={importProgress}
            className="w-2/3"
            barClassName="bg-gradient-to-r from-blue-600 to-cyan-600"
          />
        </div>
      )} */}
      {!importingPodcast && audioResponse ? (
        <MediaReview
          audioResponse={audioResponse}
          setAudioResponse={setAudioResponse}
          transcriptButtonState={transcriptButtonState}
          transcribeRecording={transcribeRecording}
          saveRecording={saveRecording}
          saveTranscript={saveTranscript}
          resetRecordingButtonState={resetRecordingButtonState}
          isTranscript={transcript.text !== ''}
          saveButtonState={saveButtonState}
          saveTranscriptButtonState={saveTranscriptButtonState}
        />
      ) : null}

      {transcript.text && (
        <div className="flex flex-col mt-6 rounded-lg bg-gray-200 p-6">
          {transcript.language && (
            <span className="mb-2 text-sm text-gray-600">
              Detected language: {getLangName(transcript.language ?? '')}
            </span>
          )}
          <span>{transcript.text}</span>
        </div>
      )}
    </div>
  );
};

export default CaptureAudio;
