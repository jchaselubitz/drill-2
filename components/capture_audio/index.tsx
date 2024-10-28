'use client';

import React from 'react';
import RecordButton, { RecordButtonStateType } from './record_button';
import ImportPodcast from './import_podcast';
import UploadButton from './upload_button';
import { recordAudio, RecordAudioResult, savePrivateAudioFile } from '@/lib/helpers/helpersAudio';
import MediaReview from './media_review';
import { createClient } from '@/utils/supabase/client';

type CaptureAudioProps = {
  userId: string | undefined;
};

const CaptureAudio: React.FC<CaptureAudioProps> = ({ userId }) => {
  const supabase = createClient();
  const [transcriptionLoading, setTranscriptionLoading] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [recordingButtonState, setRecordingButtonState] =
    React.useState<RecordButtonStateType>('idle');
  const [recordingState, setRecordingState] = React.useState<RecordAudioResult | null>(null);
  const [audioResponse, setAudioResponse] = React.useState<any>(null);
  const [audioState, setAudioState] = React.useState<any>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [importingPodcast, setImportingPodcast] = React.useState(false);

  const resetRecordingButtonState = () => {
    setRecordingButtonState('idle');
    setRecordingState(null);
    setTranscriptionLoading(false);
    setAudioResponse(null);
    setAudioState(null);
    setTranscript('');
    setIsSaving(false);
    setIsPlaying(false);
    setImportingPodcast(false);
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
    } catch (error) {
      console.error('Error fetching podcast:', error);
      // Handle the error, e.g., show a notification to the user
    } finally {
      setRecordingButtonState('idle');
      setImportingPodcast(false);
    }
  };

  const transcribeRecording = async () => {
    setRecordingButtonState('transcribing');
    setTranscriptionLoading(true);
    const formData = new FormData();
    formData.append('userApiKey', process.env.PersonalKey as string);
    formData.append('audioFile', audioResponse.blob, 'recording.mp4');
    const { data: transcription } = await supabase.functions.invoke('speech-to-text', {
      body: formData,
    });
    setTranscriptionLoading(false);
    setRecordingButtonState('disabled');
    setTranscript(transcription.data);
  };
  const saveRecording = async () => {
    setIsSaving(true);
    const fileName = `${Date.now()}-recording`;
    const bucketName = 'user_recordings';
    await savePrivateAudioFile({
      fileName,
      path: userId as string,
      supabase: supabase,
      bucketName,
      audioFile: audioResponse.blob,
    });
    //save transcript	to database
    const { data, error: langError } = await supabase.functions.invoke('check-language', {
      body: {
        text: transcript,
      },
    });
    if (langError) {
      throw Error(`Error checking language: ${langError}`);
    }
    const lang = JSON.parse(data).lng;
    const { error } = await supabase.from('recordings').insert({
      user_id: userId,
      transcript: transcript,
      filename: fileName,
      lang,
    });
    resetRecordingButtonState();
    if (error) {
      throw Error(`Error saving recording: ${error}`);
    }
    resetRecordingButtonState();
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
      <div className="flex justify-center items-center gap-3 mb-2">
        <ImportPodcast importPodcast={importPodcast} />
        <UploadButton handleUpload={handleUpload} />
        <RecordButton recordingButtonState={recordingButtonState} handleClick={handleClick} />
      </div>
      {importingPodcast ? (
        <div>Importing podcast...</div>
      ) : audioResponse ? (
        <MediaReview
          audioResponse={audioResponse}
          transcriptionLoading={transcriptionLoading}
          transcribeRecording={transcribeRecording}
          saveRecording={saveRecording}
          resetRecordingButtonState={resetRecordingButtonState}
          isTranscript={transcript !== ''}
        />
      ) : null}
    </div>
  );
};

export default CaptureAudio;
