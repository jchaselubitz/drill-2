import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { PhraseWithTranslations } from 'kysely-codegen';
import { ArrowUpDown, Languages, MoreHorizontal } from 'lucide-react';
import TtsButton from '@/components/ai_elements/tts_button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { getLangIcon, LanguagesISO639 } from '@/lib/lists';

export const LibraryColumns: ColumnDef<PhraseWithTranslations>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 1,

    maxSize: 1,
    enablePinning: true,
  },
  {
    accessorKey: 'favorite',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.setFilterValue(column.getFilterValue() ? undefined : true)}
        >
          {column.getFilterValue() ? <StarFilledIcon color="black" /> : <StarIcon />}
        </Button>
      );
    },
    cell: ({ row, table }) => {
      return (
        <Button variant="ghost" onClick={() => table.options.meta?.toggleFavorite(row.original.id)}>
          {row.getValue('favorite') ? <StarFilledIcon color="black" /> : <StarIcon />}
        </Button>
      );
    },
    size: 1,
    maxSize: 1,
    enablePinning: true,
  },
  {
    accessorKey: 'text',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Text
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span
        className="flex font-medium max-w-full whitespace-normal "
        onClick={() => {
          row.toggleExpanded(!row.getIsExpanded());
        }}
      >
        <div className="capitalize">{row.getValue('text')}</div>
      </span>
    ),
    size: 1000,
    maxSize: 1000,
  },

  {
    accessorKey: 'Audio',
    header: '',
    cell: ({ row }) => (
      <div className="w-12">
        <TtsButton text={row.original.text} bucket={'text_to_speech'} lacksAudio={false} />
      </div>
    ),
    size: 1,
  },

  {
    accessorKey: 'lang',
    header: ({ column, table }) => {
      return (
        <Select defaultValue={''} onValueChange={(v) => column.setFilterValue(v)}>
          <SelectTrigger className="outline-none border-none hover:bg-zinc-100">
            <SelectValue placeholder={<Languages size={18} />} />
          </SelectTrigger>
          <SelectContent>
            {table.options.meta?.uniqueLanguages.map((lang: LanguagesISO639) => (
              <SelectItem key={lang} value={lang}>
                {getLangIcon(lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    cell: ({ row }) => (
      <div className="flex justify-center">{getLangIcon(row.getValue('lang'))}</div>
    ),
    size: 1,
  },

  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="flex justify-center ">
        <div className="capitalize ">{getHumanDate(row.getValue('createdAt'))}</div>
      </span>
    ),
    size: 10,
    maxSize: 10,
  },

  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const phrase = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(phrase.id)}>
              Copy phrase ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View phrase details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 1,
  },
];

export default LibraryColumns;
