'use client';

import {
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { PhraseWithTranslations } from 'kysely-codegen';
import { ChevronDown, Languages } from 'lucide-react';
import * as React from 'react';
import { FC, startTransition, useOptimistic, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { togglePhraseFavorite } from '@/lib/actions/phraseActions';
import { getLangIcon, getLangName, LanguagesISO639 } from '@/lib/lists';

import LibraryRow from './library_row';
import LibraryColumns from './library_table_columns';
import { useWindowSize } from 'react-use';

type LibraryTableProps = {
  phrases: PhraseWithTranslations[];
  setOptPhraseData: (action: PhraseWithTranslations) => void;
};

const LibraryTableBase: FC<LibraryTableProps> = ({ phrases, setOptPhraseData }) => {
  const isMobile = useWindowSize().width < 768;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: !isMobile,
    favorite: !isMobile,
    text: true,
    lang: false,
    tts: true,
    createdAt: false,
    actions: !isMobile,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20, // Default number of rows per page
  });

  const mentionedLanguages = phrases.map((phrase) => phrase.lang);
  const uniqueLanguages = Array.from(new Set(mentionedLanguages)) as LanguagesISO639[];

  const toggleFavorite = async (phraseId: string) => {
    const phrase = phrases.find((phrase) => phrase.id === phraseId);
    if (!phrase) {
      return;
    }
    startTransition(() => {
      setOptPhraseData({
        ...phrase,
        favorite: !phrase.favorite,
      });
    });
    togglePhraseFavorite({
      phraseId,
      isFavorite: !!phrases.find((phrase) => phrase.id === phraseId)?.favorite,
    });
  };

  const table = useReactTable({
    data: phrases,
    columns: LibraryColumns,
    meta: { uniqueLanguages, toggleFavorite },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2 justify-between">
        <Input
          placeholder="Filter phrases..."
          value={(table.getColumn('text')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('text')?.setFilterValue(event.target.value)}
          className="max-w-48"
        />
        <div className="flex items-center gap-2">
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
                    checked={table.getColumn('lang')?.getFilterValue() === lang}
                    onCheckedChange={(v) => {
                      table.getColumn('lang')?.setFilterValue(v ? lang : undefined);
                    }}
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="px-3 "
                      style={{
                        width: header.column.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table
                .getRowModel()
                .rows.map((row) => (
                  <LibraryRow key={row.id} row={row} setOptPhraseData={setOptPhraseData} />
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={LibraryColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function LibraryTable({ phrases }: { phrases: PhraseWithTranslations[] }) {
  const [optPhraseData, setOptPhraseData] = useOptimistic<
    PhraseWithTranslations[],
    PhraseWithTranslations
  >(phrases, (state, updatedPhrase) => {
    const updatedPhrasesIndex = state.findIndex((phrase) => phrase.id === updatedPhrase.id);
    if (updatedPhrasesIndex === -1) {
      return [...state, updatedPhrase];
    }
    return [
      ...state.slice(0, updatedPhrasesIndex),
      updatedPhrase,
      ...state.slice(updatedPhrasesIndex + 1),
    ];
  });
  console.log('optPhraseData', optPhraseData[0].tags);

  return <LibraryTableBase phrases={optPhraseData} setOptPhraseData={setOptPhraseData} />;
}
