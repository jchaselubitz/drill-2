'use client';

import { Iso639LanguageCode } from 'kysely-codegen';
import { Languages, Stars } from 'lucide-react';
import React, { FC, useState } from 'react';
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

type AudioResponse = {
  blob: Blob;
  url: string;
};

const CaptureAudio: FC = () => {
  const { userId, prefLanguage } = useUserContext();
  const supabase = createClient();

  const [transcriptButtonState, setTranscriptionLoading] = useState<ButtonLoadingState>('default');
  const [transcript, setTranscript] = useState<string>('');
  const [recordingButtonState, setRecordingButtonState] = useState<RecordButtonStateType>('idle');
  const [recordingState, setRecordingState] = useState<RecordAudioResult | null>(null);
  const [audioResponse, setAudioResponse] = useState<AudioResponse | undefined | null>(null);
  const [selectedLang, setSelectedLang] = useState<Iso639LanguageCode | '' | 'auto'>('');

  const [saveButtonState, setSaveButtonState] = useState<ButtonLoadingState>('default');
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [importingPodcast, setImportingPodcast] = useState(false);

  const resetRecordingButtonState = () => {
    setRecordingButtonState('idle');
    setRecordingState(null);
    setTranscriptionLoading('default');
    setTranscript('');
    setSaveButtonState('default');
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
    setTranscript(transcription.data);
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
      });
    }
    const { data: autoLang, error: langError } = await supabase.functions.invoke('check-language', {
      body: {
        text: transcript,
        format: LangCheckStructure,
      },
    });
    if (langError) {
      setSaveButtonState('error');
      throw Error(`Error checking language: ${langError}`);
    }
    const useAuto = selectedLang === '' || selectedLang === 'auto';
    const lang = !useAuto ? selectedLang : (JSON.parse(autoLang)?.lng ?? prefLanguage);

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

  const handleLangSelection = ({ lang }: { lang: Iso639LanguageCode; name: string }) => {
    setSelectedLang(lang);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-center items-center gap-3 mb-2 w-full">
        <ImportPodcast importPodcast={importPodcast} />
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
      {importingPodcast ? (
        <div>Importing podcast...</div>
      ) : audioResponse ? (
        <MediaReview
          audioResponse={audioResponse}
          setAudioResponse={setAudioResponse}
          transcriptButtonState={transcriptButtonState}
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
