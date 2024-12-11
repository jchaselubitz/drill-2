import { LanguagesISO639 } from '@/lib/lists';
import { RowData, Table } from '@tanstack/react-table';
import { PhraseWithAssociations } from 'kysely-codegen';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    uniqueLanguages: LanguagesISO639[];
    toggleFavorite: (phraseId: string) => void;
    setSelectedPhrase: (phraseId: string, table: Table<PhraseWithAssociations>) => void;
  }
}
