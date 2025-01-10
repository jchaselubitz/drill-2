import { Iso639LanguageCode } from 'kysely-codegen';
import { useState } from 'react';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { cn } from '@/lib/utils';

import PhraseContextMenu from '../capture_text/phrase_context_menu';

interface BaseObjectCardProps {
  withoutDetails: React.ReactNode;
  objectDetails: React.ReactNode;
  text: string;
  date: Date;
  phraseId: string;
  lang: Iso639LanguageCode;
}

const BaseObjectCard: React.FC<BaseObjectCardProps> = ({
  withoutDetails,
  objectDetails,
  text,
  date,
  phraseId,
  lang,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <div
      className={cn(
        'rounded-lg w-full',
        'hover:bg-zinc-100 hover:shadow-sm focus:bg-slate-300 transition-colors duration-200 ease-in-out',
        'bg-zinc-100'
      )}
    >
      <div className="p-4 w-full" onClick={() => setDetailsOpen(!detailsOpen)} tabIndex={0}>
        <div className="flex justify-between gap-2 text-left items-center">
          <div>
            <div className="text-gray-400 text-xs mb-1">{getHumanDate(date)}</div>
            <h3
              className={cn('text-gray-700 text-sm font-bold', !detailsOpen && 'line-clamp-2')}
              onClick={(e) => e.stopPropagation()}
            >
              <PhraseContextMenu phrase={text} associatedPhraseId={phraseId} lang={lang} />
            </h3>
          </div>
          {withoutDetails}
        </div>
      </div>
      {detailsOpen && <div className="p-2">{objectDetails}</div>}
    </div>
  );
};

export default BaseObjectCard;
