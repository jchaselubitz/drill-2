'use client';

import React, { FC, useState } from 'react';
import { useUserContext } from '@/contexts/user_context';
import { addPhrase } from '@/lib/actions/phraseActions';
import { recordAudio, RecordAudioResult, savePrivateAudioFile } from '@/lib/helpers/helpersAudio';
import { createClient } from '@/utils/supabase/client';

import { ButtonLoadingState } from '../ui/button-loading';
import ImportPodcast from './import_podcast';
import MediaReview from './media_review';
import RecordButton, { RecordButtonStateType } from './record_button';
import UploadButton from './upload_button';

type AudioResponse = {
  blob: Blob;
  url: string;
};

const CaptureAudio: FC = () => {
  const { userId } = useUserContext();
  const supabase = createClient();
  const [transcriptionLoading, setTranscriptionLoading] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [recordingButtonState, setRecordingButtonState] = useState<RecordButtonStateType>('idle');
  const [recordingState, setRecordingState] = useState<RecordAudioResult | null>(null);
  const [audioResponse, setAudioResponse] = useState<AudioResponse | undefined | null>(null);

  const [saveButtonState, setSaveButtonState] = useState<ButtonLoadingState>('default');
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [importingPodcast, setImportingPodcast] = useState(false);

  const resetRecordingButtonState = () => {
    setRecordingButtonState('idle');
    setRecordingState(null);
    setTranscriptionLoading(false);
    setTranscript('');
    // setIsSaving(false);
    // setIsPlaying(false);
    setImportingPodcast(false);
    setAudioResponse(null);
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
    setTranscript('');
    setRecordingButtonState('disabled');
    const audioBlob = new Blob([file], { type: 'audio/mp4' });
    const url = URL.createObjectURL(audioBlob);
    setAudioResponse({ blob: audioBlob, url: url });
  };

  const importPodcast = async (url: string) => {
    setTranscript('');
    setImportingPodcast(true);
    setAudioResponse(null);
    try {
      setRecordingButtonState('disabled');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioResponse({ blob: audioBlob, url: audioURL });
    } catch (error: any) {
      throw Error('Error fetching podcast:', error);
    } finally {
      setRecordingButtonState('idle');
      setImportingPodcast(false);
    }
  };

  const transcribeRecording = async () => {
    setRecordingButtonState('transcribing');
    setTranscriptionLoading(true);
    const formData = new FormData();
    // formData.append('userApiKey', undefined);
    if (!audioResponse) {
      throw Error('No audio response to transcribe');
    }
    formData.append('audioFile', audioResponse.blob, 'recording.mp4');
    const { data: transcription } = await supabase.functions.invoke('speech-to-text', {
      body: formData,
    });
    setTranscriptionLoading(false);
    setRecordingButtonState('disabled');
    setTranscript(transcription.data);
  };

  const saveRecording = async () => {
    setSaveButtonState('loading');
    const fileName = `${Date.now()}-recording`;
    const bucketName = 'user_recordings';
    if (audioResponse) {
      await savePrivateAudioFile({
        fileName,
        path: userId as string,
        supabase: supabase,
        bucketName,
        audioFile: audioResponse.blob,
      });
    }
    const { data, error: langError } = await supabase.functions.invoke('check-language', {
      body: {
        text: transcript,
      },
    });
    if (langError) {
      setSaveButtonState('error');
      throw Error(`Error checking language: ${langError}`);
    }
    const lang = JSON.parse(data).lng;

    try {
      await addPhrase({
        text: transcript,
        filename: fileName,
        lang,
        type: 'recording',
        source: 'home',
      });
      setSaveButtonState('success');
      resetRecordingButtonState();
      return;
    } catch (error) {
      setSaveButtonState('error');
      resetRecordingButtonState();
      throw Error(`Error saving recording: ${error}`);
    }
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

  return (
    <div>
      <div className="flex justify-center items-center gap-3 mb-2 w-full">
        <ImportPodcast importPodcast={importPodcast} />
        <UploadButton handleUpload={handleUpload} />
        <RecordButton recordingButtonState={recordingButtonState} handleClick={handleClick} />
      </div>
      {importingPodcast ? (
        <div>Importing podcast...</div>
      ) : audioResponse ? (
        <MediaReview
          audioResponse={audioResponse}
          setAudioResponse={setAudioResponse}
          transcriptionLoading={transcriptionLoading}
          transcribeRecording={transcribeRecording}
          saveRecording={saveRecording}
          resetRecordingButtonState={resetRecordingButtonState}
          isTranscript={transcript !== ''}
          saveButtonState={saveButtonState}
        />
      ) : null}

      {transcript && <div className="flex mt-6 rounded-lg bg-gray-200 p-6">{transcript}</div>}
    </div>
  );
};

export default CaptureAudio;
