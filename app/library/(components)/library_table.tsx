'use client';

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Iso639LanguageCode, PhraseType, PhraseWithAssociations } from 'kysely-codegen';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { FC, startTransition, useOptimistic, useState } from 'react';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLibraryContext } from '@/contexts/library_context';
import { useUserContext } from '@/contexts/user_context';
import { togglePhraseFavorite } from '@/lib/actions/phraseActions';
import { cn } from '@/lib/utils';

import LibraryRow from './library_row';
import LibraryColumns from './library_table_columns';
import LibraryTableHeaderTools from './library_table_header_tools';

type LibraryTableProps = {
  phrases: PhraseWithAssociations[];
  className?: string;
  selectedPage: number | undefined;
  setOptPhraseData: (action: PhraseWithAssociations) => void;
};

const LibraryTableBase: FC<LibraryTableProps> = ({
  phrases,
  setOptPhraseData,
  selectedPage,
  className,
}) => {
  const isMobile = useWindowSize().width < 768;

  const { prefLanguage } = useUserContext();
  const { setSelectedPhrasePage, selectedPhraseId } = useLibraryContext();
  const router = useRouter();

  const getItem = (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  };

  const storedSortLang = getItem('sort_lang');
  const setSortLang = !storedSortLang
    ? prefLanguage
    : storedSortLang === '*'
      ? ''
      : (storedSortLang as Iso639LanguageCode);
  const storedSortType = getItem('sort_type');
  const setSortType =
    !storedSortType || storedSortType === '*' ? '' : (storedSortType as PhraseType);

  const storedSortSource = getItem('sort_source');
  const setSortSource =
    storedSortSource && JSON.parse(storedSortSource).length > 0 ? JSON.parse(storedSortSource) : [];

  const defaultFilters = [
    {
      id: 'Language',
      value: setSortLang,
    },
    {
      id: 'type',
      value: setSortType,
    },
  ];
  if (setSortSource.length) {
    defaultFilters.push({
      id: 'source',
      value: setSortSource,
    });
  }

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters);
  const [pagination, setPagination] = useState({
    pageIndex: selectedPage ?? 0, // Default page index
    pageSize: 20, // Default number of rows per page
  });
  console.log('pagination', pagination);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: !isMobile,
    favorite: true,
    text: true,
    language: false,
    audio: !isMobile,
    tags: false,
    type: true,
    Date: false,
    source: false,
    actions: !isMobile,
  });
  const [rowSelection, setRowSelection] = useState({});
  const mentionedLanguages = phrases.map((phrase) => phrase.lang);
  const uniqueLanguages = Array.from(new Set(mentionedLanguages)) as Iso639LanguageCode[];
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
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const getRowPage = (phraseId: string) => {
    const row = table
      .getRowModel()
      .rows.find((row) => row.original.id.toString() === phraseId.toString());
    if (!row) {
      return null;
    }
    return Math.floor(row.index / pagination.pageSize);
  };

  return (
    <div className={cn('w-full px-1 ', className)}>
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
                  <LibraryRow key={row.original.id} row={row} page={getRowPage(row.original.id)} />
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
            onClick={() => {
              setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
              setSelectedPhrasePage({ page: pagination.pageIndex - 1 });
            }}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span>
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
              setSelectedPhrasePage({ page: pagination.pageIndex + 1 });
            }}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function LibraryTable({
  phrases,
  className,
}: {
  phrases: PhraseWithAssociations[];
  className?: string;
}) {
  const { selectedPage } = useLibraryContext();
  const [optPhraseData, setOptPhraseData] = useOptimistic<
    PhraseWithAssociations[],
    PhraseWithAssociations
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

  return (
    <LibraryTableBase
      phrases={optPhraseData}
      setOptPhraseData={setOptPhraseData}
      selectedPage={selectedPage}
      // pagination={pagination}
      // setPagination={setPagination}
      className={className}
    />
  );
}

export const LibraryTableSkeleton = () => {
  return (
    <div className="w-full px-1">
      <Table>
        <div className="flex flex-col gap-2 mt-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </Table>
    </div>
  );
};
