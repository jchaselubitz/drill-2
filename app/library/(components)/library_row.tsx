import { flexRender, Row } from '@tanstack/react-table';
import { PhraseWithTranslations } from 'kysely-codegen';
import React, { Fragment } from 'react';
import PhraseCardDetails from '@/components/phrases/phrase_card_details';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { getLangIcon } from '@/lib/lists';
import TagList from '@/components/tags/tag_list';

interface LibraryRowProps {
  row: Row<PhraseWithTranslations>;
}

const LibraryRow: React.FC<LibraryRowProps> = ({ row }) => {
  const visibleCells = row.getVisibleCells();
  const expanded = row.getIsExpanded();

  return (
    <Fragment key={row.id}>
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && 'selected'}
        className={cn(expanded && 'border-b-0 bg-zinc-100 dark:bg-zinc-800')}
        onClick={() => row.toggleExpanded()}
      >
        {visibleCells.map((cell) => (
          <TableCell key={cell.id} className="px-3 py-2" style={{ width: cell.column.getSize() }}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={visibleCells.length} className="p-3 bg-zinc-100 dark:bg-zinc-800">
            <div className="p-1 md:p-3 w-full">
              <div className="flex items-center justify-between">
                <div className="flex flex-col w-full mb-3 p-1 text-xs font-medium">
                  <div>Created: {getHumanDate(row.original.createdAt)}</div>
                  <div>Language: {getLangIcon(row.original.lang)}</div>
                  {row.original.source && <div>Source: {row.original.source}</div>}
                </div>
                <TagList phraseId={row.original.id} tags={row.original.tags} />
              </div>
              <PhraseCardDetails phrase={row.original} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

export default LibraryRow;
