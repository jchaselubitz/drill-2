import { flexRender, Row, Table } from '@tanstack/react-table';
import { PhraseWithAssociations } from 'kysely-codegen';
import React, { Fragment } from 'react';
import PhraseCardDetails from '@/components/phrasesAndRecordings/phrase_card_details';
import TagList from '@/components/tags/tag_list';
import { TableCell, TableRow } from '@/components/ui/table';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { getLangIcon } from '@/lib/lists';
import { cn } from '@/lib/utils';

interface LibraryRowProps {
  row: Row<PhraseWithAssociations>;
  table: Table<PhraseWithAssociations>;
  setOptPhraseData: (action: PhraseWithAssociations) => void;
  userTags: string[];
}

const LibraryRow: React.FC<LibraryRowProps> = ({ row, table, userTags, setOptPhraseData }) => {
  const visibleCells = row.getVisibleCells();
  const expanded = row.getIsExpanded();

  const toggleExpanded = (phraseId: string) => {
    table.options.meta?.toggleExpanded(phraseId.toString(), table);
  };

  return (
    <Fragment key={row.original.id}>
      <TableRow
        data-state={row.getIsSelected() && 'selected'}
        className={cn(expanded && 'border-b-0 bg-zinc-100 dark:bg-zinc-800')}
        onClick={() => {
          toggleExpanded(row.original.id);
        }}
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
                <TagList
                  phrase={row.original}
                  setOptPhraseData={setOptPhraseData}
                  userTags={userTags}
                />
              </div>
              <PhraseCardDetails phrase={row.original} toggleExpanded={toggleExpanded} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

export default LibraryRow;
