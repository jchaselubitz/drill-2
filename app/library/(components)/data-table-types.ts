import { LanguagesISO639 } from '@/lib/lists';
import { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    uniqueLanguages: LanguagesISO639[];
  }
}
