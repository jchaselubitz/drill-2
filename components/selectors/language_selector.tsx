'use client';

import { Iso639LanguageCode } from 'kysely-codegen';
import { LucideIcon, Stars } from 'lucide-react';
import { FC, ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getLangIcon, getLangName, Languages } from '@/lib/lists';
import { cn } from '@/lib/utils';

type LanguageMenuProps = {
  props: {
    label: string | ReactNode;
    name: string;
    language: Iso639LanguageCode | null | undefined | '' | 'auto';
    icon: LucideIcon;
  };
  iconOnly?: boolean;
  borderZero?: boolean;
  automaticOption?: boolean;
  onClick?: ({ lang, name }: { lang: Iso639LanguageCode; name: string }) => void;
};

const LanguageMenu: FC<LanguageMenuProps> = ({
  props,
  onClick,
  iconOnly,
  automaticOption,
  borderZero,
}) => {
  const { label, name, language } = props;
  const handleClick = (lang: Iso639LanguageCode) => {
    if (onClick) {
      onClick({ lang, name });
    }
  };

  const standardTrigger = (
    <SelectTrigger
      className={cn(borderZero && 'border-0 focus:ring-0 focus:border-0 focus:ring-offset-0')}
    >
      <div className="flex flex-1 text-left text-sm gap-2 ">
        <span className="text-lg font-bold">
          <props.icon size={18} />
        </span>
        <span className="truncate font-semibold">{language ? getLangName(language) : label}</span>
      </div>
    </SelectTrigger>
  );

  const iconTrigger = (
    <SelectTrigger
      className={cn(
        'rounded-full w-fit gap-2 ',
        borderZero &&
          'border-0 focus:ring-0 focus:border-0 focus:ring-offset-0 hover:bg-zinc-100 rounded-lg'
      )}
    >
      <SelectValue placeholder={language ? getLangIcon(language) : <Stars size={18} />} />
    </SelectTrigger>
  );

  return (
    <Select onValueChange={(v) => handleClick(v as Iso639LanguageCode)}>
      {iconOnly ? iconTrigger : standardTrigger}
      <SelectContent>
        {automaticOption && (
          <SelectItem key="auto" value="auto">
            <div className="flex items-center gap-2 text-left text-sm leading-tight">
              <span className="text-lg font-bold">
                <Stars size={18} />
              </span>
              <span className="truncate font-semibold">Auto</span>
            </div>
          </SelectItem>
        )}
        {Languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <div className="flex items-center gap-2 text-left text-sm leading-tight">
              <span className="text-lg font-bold">{getLangIcon(lang.value)}</span>
              <span className="truncate font-semibold">{getLangName(lang.value)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageMenu;
