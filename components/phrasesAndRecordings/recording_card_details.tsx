import { Iso639LanguageCode, PhraseWithTranslations } from 'kysely-codegen';
import React, { useState } from 'react';
import { useUserContext } from '@/contexts/user_context';
import { deletePhrase } from '@/lib/actions/phraseActions';
import { getContentSuggestions, TranscriptRequestSuggestions } from '@/lib/lists';

import ContentRequest from '../ai_elements/content_request';
import DeleteButton from '../specialButtons/delete_button';
import { AudioPlayButton } from '../ui/audio-play-button';

interface RecordingCardDetailsProps {
  userId?: string;
  recording: PhraseWithTranslations;
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
    await deletePhrase(recording.id);
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
        text={recording.text}
        lang={recording.lang as Iso639LanguageCode}
        userId={userId}
        phraseId={recording.id}
        phraseType={recording.type}
        primaryPhraseIds={[recording.id]}
        source="transcript"
        suggestions={getContentSuggestions({
          userLanguage,
          prefLanguage: recording.lang as Iso639LanguageCode,
          contentLang: recording.lang as Iso639LanguageCode,
          suggestionList: TranscriptRequestSuggestions,
        })}
      />
    </div>
  );
};

export default RecordingCardDetails;
