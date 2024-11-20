import React, { useState } from 'react';

import { AudioPlayButton } from '../ui/audio-play-button';
import { getContentSuggestions, LanguagesISO639, TranscriptRequestSuggestions } from '@/lib/lists';
import { BaseRecording } from 'kysely-codegen';
import { useUserContext } from '@/contexts/user_context';
import ContentRequest from '../ai_elements/content_request';
import DeleteButton from '../specialButtons/delete_button';
import { deleteRecording } from '@/lib/actions/recordingActions';

interface RecordingCardDetailsProps {
  userId?: string;
  recording: BaseRecording;
  isPlaying: boolean;
  handlePlayClick: () => void;
}

const RecordingCardDetails: React.FC<RecordingCardDetailsProps> = ({
  recording,
  isPlaying,
  handlePlayClick,
}) => {
  const { userId, userLanguage } = useUserContext();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    await deleteRecording(recording.id);
    setDeleteLoading(false);
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex justify-center gap-2">
        <DeleteButton onClick={handleDelete} isLoading={deleteLoading} />
        <AudioPlayButton
          handleClick={handlePlayClick}
          isPlaying={isPlaying}
          isLoading={false}
          exists={true}
        />
      </div>
      <ContentRequest
        text={recording.transcript}
        lang={recording.lang as LanguagesISO639}
        userId={userId}
        source="transcript"
        suggestions={getContentSuggestions({
          userLanguage,
          prefLanguage: recording.lang as LanguagesISO639,
          contentLang: recording.lang as LanguagesISO639,
          suggestionList: TranscriptRequestSuggestions,
        })}
      />
    </div>
  );
};

export default RecordingCardDetails;