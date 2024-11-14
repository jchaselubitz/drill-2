import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { PhraseWithTranslations } from 'kysely-codegen';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from '@/lib/helpers/lists';
import { getLangName, LanguagesISO639 } from '@/lib/lists';

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
      <span className="flex flex-1">
        <span className="md:pl-2 font-medium w-full truncate">
          <div className="capitalize">{row.getValue('text')}</div>{' '}
        </span>
      </span>
    ),
  },

  {
    accessorKey: 'lang',
    header: ({ column, table }) => {
      return (
        <Select defaultValue={''} onValueChange={(v) => column.setFilterValue(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {table.options.meta?.uniqueLanguages.map((lang: LanguagesISO639) => (
              <SelectItem key={lang} value={lang}>
                {getLangName(lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    cell: ({ row }) => <div className="lowercase">{getLangName(row.getValue('lang'))}</div>,
    size: 10,
    enableResizing: false,
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
  },
];

export default LibraryColumns;
