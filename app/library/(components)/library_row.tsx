import { flexRender, Row } from '@tanstack/react-table';
import { PhraseWithTranslations } from 'kysely-codegen';
import React, { Fragment } from 'react';
import PhraseCardDetails from '@/components/phrases/phrase_card_details';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

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
        ))}{' '}
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={visibleCells.length} className="p-3 bg-zinc-100 dark:bg-zinc-800">
            <div className="p-3">
              <PhraseCardDetails phrase={row.original} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

export default LibraryRow;
