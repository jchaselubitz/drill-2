import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { PhraseType, PhraseWithAssociations } from 'kysely-codegen';
import { ArrowUpDown, Languages } from 'lucide-react';
import TtsButton from '@/components/ai_elements/tts_button';
import RecordingPlayButton from '@/components/specialButtons/recording_play_button';
import TagList from '@/components/tags/tag_list';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { getLangIcon, getPhraseTypeIcon } from '@/lib/lists';

export const LibraryColumns: ColumnDef<PhraseWithAssociations>[] = [
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
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
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
          onClick={(e) => {
            column.setFilterValue(column.getFilterValue() ? undefined : true);
          }}
        >
          {column.getFilterValue() ? <StarFilledIcon color="black" /> : <StarIcon />}
        </Button>
      );
    },
    cell: ({ row, table }) => {
      return (
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            table.options.meta?.toggleFavorite(row.original.id);
          }}
        >
          {row.getValue('favorite') ? <StarFilledIcon color="black" /> : <StarIcon />}
        </Button>
      );
    },
    size: 1,
    maxSize: 1,
    enableHiding: true,
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
      <span className="flex font-medium max-w-full whitespace-normal w-full">
        <div className="line-clamp-2">{row.getValue('text')}</div>
      </span>
    ),
    size: 1000,
    maxSize: 1000,
    enableHiding: false,
  },

  {
    accessorKey: 'tags',
    header: '',
    cell: ({ row }) => (
      <span className="flex justify-center">{<TagList phrase={row.original} />}</span>
    ),
    size: 10,
    maxSize: 10,
    enableHiding: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;
      const tags = row.original.tags;
      const labels = tags.map((tag) => tag.label);
      return labels.some((label) => filterValue.includes(label));
    },
  },
  {
    accessorKey: 'audio',
    header: '',
    cell: ({ row }) => (
      <div className="w-12">
        {row.original.type === 'recording' ? (
          <RecordingPlayButton phrase={row.original} />
        ) : (
          <TtsButton text={row.original.text} bucket={'text_to_speech'} lacksAudio={false} />
        )}
      </div>
    ),
    size: 1,
    enableHiding: true,
  },

  {
    accessorKey: 'lang',
    header: () => {
      return <Languages size={18} />;
    },
    cell: ({ row }) => (
      <div className="flex justify-center">{getLangIcon(row.getValue('lang'))}</div>
    ),
    size: 1,
    enableHiding: true,
  },

  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <div className="flex justify-center">
        {getPhraseTypeIcon(row.getValue('type') as PhraseType, 20)}
      </div>
    ),
    size: 1,
    enableHiding: true,
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
          Created
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
    enableHiding: true,
  },

  // {
  //   id: 'actions',

  //   cell: ({ row }) => {
  //     const phrase = row.original;
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem onClick={() => navigator.clipboard.writeText(phrase.id)}>
  //             Copy phrase ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>View customer</DropdownMenuItem>
  //           <DropdownMenuItem>View phrase details</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  //   size: 1,
  // },
];

export default LibraryColumns;
