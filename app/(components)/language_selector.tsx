'use client';

import { Iso639LanguageCode } from 'kysely-codegen';
import { LucideIcon } from 'lucide-react';
import { FC } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { getLangIcon, getLangName, Languages } from '@/lib/lists';

type LanguageMenuProps = {
  props: {
    label: string;
    name: string;
    language: Iso639LanguageCode | null | undefined;
    icon: LucideIcon;
  };
  onClick?: ({ lang, name }: { lang: Iso639LanguageCode; name: string }) => void;
};

const LanguageMenu: FC<LanguageMenuProps> = ({ props, onClick }) => {
  const { label, name, language } = props;
  const handleClick = (lang: Iso639LanguageCode) => {
    if (onClick) {
      onClick({ lang, name });
    }
  };
  return (
    <Select onValueChange={(v) => handleClick(v as Iso639LanguageCode)}>
      <SelectTrigger>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            <props.icon size={18} />
          </span>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {language ? getLangName(language) : label}
            </span>
          </div>
        </div>
      </SelectTrigger>
      <SelectContent className="w-56">
        {Languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {' '}
            <div className="flex items-center gap-1 text-left text-sm leading-tight">
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
