import { Iso639LanguageCode } from 'kysely-codegen';
import { useState } from 'react';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { cn } from '@/lib/utils';

import PhraseContextMenu from '../capture_text/phrase_context_menu';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

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
      <div className="pt-4 px-4 w-full" onClick={() => setDetailsOpen(!detailsOpen)} tabIndex={0}>
        <div className="flex justify-between gap-2 text-left  pb-2">
          <div>
            <div className="text-gray-400 text-xs mb-1">{getHumanDate(date)}</div>
            <h3
              className={cn('text-gray-700 text-sm font-bold')}
              onClick={(e) => detailsOpen && e.stopPropagation()}
            >
              {!detailsOpen ? (
                <div className="line-clamp-2">{text}</div>
              ) : (
                <PhraseContextMenu phrase={text} associatedPhraseId={phraseId} lang={lang} />
              )}
            </h3>
          </div>
          <div className="flex flex-col items-center gap-2">
            {withoutDetails}

            <div className=" flex justify-center opacity-50">
              {detailsOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
        </div>
      </div>
      {detailsOpen && (
        <>
          <div className="">{objectDetails}</div>

          <div className="border-t border-slate-200 p-4 py-2">
            <Link href={`/library?phrase=${phraseId}`} className="text-xs hover:underline">
              See in Library
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default BaseObjectCard;
