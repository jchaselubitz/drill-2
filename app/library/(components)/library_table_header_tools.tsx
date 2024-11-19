import { Table } from '@tanstack/react-table';
import { PhraseWithTranslations } from 'kysely-codegen';
import { ChevronDown, Hash, Languages } from 'lucide-react';
import React from 'react';
import Tag from '@/components/tags/tag';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { getLangIcon, getLangName, LanguagesISO639 } from '@/lib/lists';

interface LibraryTableHeaderToolsProps {
  table: Table<PhraseWithTranslations>;
  uniqueLanguages: LanguagesISO639[];
  userTags: string[];
}

const LibraryTableHeaderTools: React.FC<LibraryTableHeaderToolsProps> = ({
  table,
  uniqueLanguages,
  userTags,
}) => {
  const textColumn = table.getColumn('text');
  const textColumnCurrentFilter = textColumn?.getFilterValue();

  const tagsColumn = table.getColumn('tags');
  const tagsColumnCurrentFilter = (tagsColumn?.getFilterValue() as string[]) ?? [];

  const langColumn = table.getColumn('lang');
  const langColumnCurrentFilter = langColumn?.getFilterValue();

  const handleFilterText = (event: React.ChangeEvent<HTMLInputElement>) => {
    textColumn?.setFilterValue(event.target.value);
  };

  const handleFilterTags = (v: boolean, tag: string) => {
    v
      ? tagsColumn?.setFilterValue([...tagsColumnCurrentFilter, tag])
      : tagsColumn?.setFilterValue(tagsColumnCurrentFilter?.filter((t) => t !== tag));
  };

  const handleFilterLang = (v: boolean, lang: LanguagesISO639) => {
    langColumn?.setFilterValue(v ? lang : undefined);
  };

  return (
    <div className="flex items-center py-4 gap-2 justify-between">
      <Input
        placeholder="Filter by title..."
        value={(textColumnCurrentFilter as string) ?? ''}
        onChange={(e) => handleFilterText(e)}
        className="max-w-48"
      />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Hash size={18} /> <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {userTags?.map((tag) => {
              return (
                <DropdownMenuCheckboxItem
                  key={tag}
                  className="capitalize flex items-center gap-1"
                  checked={tagsColumnCurrentFilter.includes(tag)}
                  onCheckedChange={(v) => {
                    handleFilterTags(v, tag);
                  }}
                >
                  <Tag label={tag} />
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Languages size={18} /> <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {uniqueLanguages.map((lang) => {
              return (
                <DropdownMenuCheckboxItem
                  key={lang}
                  className="capitalize flex items-center gap-1"
                  checked={langColumnCurrentFilter === lang}
                  onCheckedChange={(v) => handleFilterLang(v, lang)}
                >
                  {getLangIcon(lang)} {getLangName(lang)}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default LibraryTableHeaderTools;
