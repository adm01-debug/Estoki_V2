// CRUD Toolkit - Índice de Exports

// Hooks
export { useCRUD } from '@/hooks/useCRUD';
export { useSavedFilters } from '@/hooks/useSavedFilters';
export { useFulltextSearch } from '@/hooks/useFulltextSearch';
export { useDebouncedValue } from '@/hooks/useDebouncedValue';
export { useVersioning } from '@/hooks/useVersioning';
export { useDuplicate } from '@/hooks/useDuplicate';
export { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
export { useBulkActions } from '@/hooks/useBulkActions';
export { useSoftDelete } from '@/hooks/useSoftDelete';

// Components
export { DataImporter } from '@/components/DataImporter';
export { SavedFiltersDropdown } from '@/components/SavedFiltersDropdown';
export { SearchInput } from '@/components/SearchInput';
export { BulkActionsBar } from '@/components/BulkActionsBar';
export { DuplicateButton } from '@/components/DuplicateButton';
export { VersionHistory } from '@/components/VersionHistory';

// Utilities
export { importCSV, generateCSVTemplate } from '@/lib/csvImporter';
export { importExcel, downloadExcel } from '@/lib/excelImporter';
