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
import { PhraseWithTranslations } from 'kysely-codegen';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { startTransition, useOptimistic, useState } from 'react';
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
import { LanguagesISO639 } from '@/lib/lists';

import LibraryColumns from './library_table_columns';

function _LibraryTable({
  phrases,
  setOptPhraseData,
}: {
  phrases: PhraseWithTranslations[];
  setOptPhraseData: (action: PhraseWithTranslations) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
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
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter phrases..."
          value={(table.getColumn('text')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('text')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="px-3"
                      style={{
                        width: header.getSize(),
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
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
}

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

  return <_LibraryTable phrases={optPhraseData} setOptPhraseData={setOptPhraseData} />;
}
