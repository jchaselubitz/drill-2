import { Iso639LanguageCode, PhraseWithTranslations } from 'kysely-codegen';
import React from 'react';
import { useUserContext } from '@/contexts/user_context';

import { getContentSuggestions, TranscriptRequestSuggestions } from '@/lib/lists';

import ContentRequest from '../ai_elements/content_request';

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

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="p-4">
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
    </div>
  );
};

export default RecordingCardDetails;
