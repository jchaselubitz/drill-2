import { RowData } from '@tanstack/react-table';
import { Iso639LanguageCode } from 'kysely-codegen';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    uniqueLanguages: Iso639LanguageCode[];
    toggleFavorite: (phraseId: string) => void;
  }
}
