import { useState } from 'react';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { cn } from '@/lib/utils';

interface BaseObjectCardProps {
  withoutDetails: React.ReactNode;
  objectDetails: React.ReactNode;
  text: string | null;
  date: Date;
}

const BaseObjectCard: React.FC<BaseObjectCardProps> = ({
  withoutDetails,
  objectDetails,
  text,
  date,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <div
      className={cn(
        'rounded-lg w-full',
        'hover:bg-gray-200 hover:shadow-sm focus:bg-slate-300 transition-colors duration-200 ease-in-out',
        'bg-gray-100'
      )}
    >
      <div className="p-4 w-full" onClick={() => setDetailsOpen(!detailsOpen)} tabIndex={0}>
        <div className="flex justify-between gap-2 text-left items-center">
          <div>
            <div className="text-gray-400 text-xs mb-1">{getHumanDate(date)}</div>
            <h3 className={cn('text-gray-700 text-sm font-bold', !detailsOpen && 'line-clamp-2')}>
              {text}
            </h3>
          </div>
          {withoutDetails}
        </div>
      </div>
      {detailsOpen && <div className="p-4">{objectDetails}</div>}
    </div>
  );
};

export default BaseObjectCard;
