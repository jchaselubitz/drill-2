import { flexRender, Row, Table } from '@tanstack/react-table';
import { PhraseWithAssociations } from 'kysely-codegen';
import React, { Fragment } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

interface LibraryRowProps {
  row: Row<PhraseWithAssociations>;
  table: Table<PhraseWithAssociations>;
}

const LibraryRow: React.FC<LibraryRowProps> = ({ row, table }) => {
  const visibleCells = row.getVisibleCells();

  const setPhrase = (phraseId: string) => {
    table.options.meta?.setSelectedPhrase(phraseId.toString(), table);
  };

  return (
    <Fragment key={row.original.id}>
      <TableRow
        data-state={row.getIsSelected() && 'selected'}
        onClick={() => {
          setPhrase(row.original.id);
        }}
      >
        {visibleCells.map((cell) => (
          <TableCell key={cell.id} className="px-3 py-2" style={{ width: cell.column.getSize() }}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </Fragment>
  );
};

export default LibraryRow;
