'use client';

import { getHumanDate } from '@/lib/helpers/helpersDate';

interface UnstyledDateProps {
  date: Date | string;
  className?: string;
}

const UnstyledDate: React.FC<UnstyledDateProps> = ({ date, className }) => {
  function isString(date: string | Date): date is string {
    return (date as string) !== null;
  }
  if (isString(date)) {
    date = new Date(date);
  }

  return <span className={className}>{getHumanDate(date)}</span>;
};

export default UnstyledDate;
