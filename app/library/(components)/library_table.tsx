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
  Updater,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { PhraseType, PhraseWithTranslations } from 'kysely-codegen';
import * as React from 'react';
import { FC, startTransition, useOptimistic, useState } from 'react';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserContext } from '@/contexts/user_context';
import { togglePhraseFavorite } from '@/lib/actions/phraseActions';
import { LanguagesISO639 } from '@/lib/lists';

import LibraryRow from './library_row';
import LibraryColumns from './library_table_columns';
import LibraryTableHeaderTools from './library_table_header_tools';

type LibraryTableProps = {
  phrases: PhraseWithTranslations[];
  setOptPhraseData: (action: PhraseWithTranslations) => void;
};

const LibraryTableBase: FC<LibraryTableProps> = ({ phrases, setOptPhraseData }) => {
  const isMobile = useWindowSize().width < 768;
  const { prefLanguage } = useUserContext();
  const storedSortLang = localStorage.getItem('sort_lang');
  const setSortLang = !storedSortLang
    ? prefLanguage
    : storedSortLang === '*'
      ? ''
      : (storedSortLang as LanguagesISO639);

  const storedSortType = localStorage.getItem('sort_type');
  const setSortType =
    !storedSortType || storedSortType === '*' ? '' : (storedSortType as PhraseType);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: 'lang',
      value: setSortLang,
    },
    {
      id: 'type',
      value: setSortType,
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: !isMobile,
    favorite: true,
    text: true,
    lang: false,
    audio: !isMobile,
    tags: false,
    type: true,
    createdAt: false,
    actions: !isMobile,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Default page index
    pageSize: 20, // Default number of rows per page
  });

  const mentionedLanguages = phrases.map((phrase) => phrase.lang);
  const uniqueLanguages = Array.from(new Set(mentionedLanguages)) as LanguagesISO639[];
  const userTags = [...new Set(phrases.flatMap((phrase) => phrase.tags.map((tag) => tag.label)))];

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

  const handleExpanded = (updater: Updater<ExpandedState>) => {
    setExpanded(updater);
  };

  const table = useReactTable({
    data: phrases,
    columns: LibraryColumns,
    meta: { uniqueLanguages, toggleFavorite },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: (value) => handleExpanded(value),
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
      <LibraryTableHeaderTools
        table={table}
        uniqueLanguages={uniqueLanguages}
        userTags={userTags}
      />
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
                  <LibraryRow
                    key={row.original.id}
                    row={row}
                    setOptPhraseData={setOptPhraseData}
                    userTags={userTags}
                  />
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

  return <LibraryTableBase phrases={optPhraseData} setOptPhraseData={setOptPhraseData} />;
}
