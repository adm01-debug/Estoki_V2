import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataTable } from './use-data-table';

describe('useDataTable', () => {
  const mockData = [
    { id: '1', name: 'Product A', category: 'Category 1' },
    { id: '2', name: 'Product B', category: 'Category 2' },
    { id: '3', name: 'Product C', category: 'Category 1' },
  ];

  const mockColumns = [
    { key: 'id', header: 'ID', sortable: true, filterable: true },
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'category', header: 'Category', sortable: true, filterable: true },
  ];

  it('should initialize with provided data', () => {
    const { result } = renderHook(() => useDataTable({
      data: mockData,
      columns: mockColumns,
      keyField: 'id',
      initialPageSize: 10,
    }));

    expect(result.current.filteredData).toHaveLength(3);
    expect(result.current.paginatedData).toHaveLength(3);
  });

  it('should filter data based on global filter', () => {
    const { result } = renderHook(() => useDataTable({
      data: mockData,
      columns: mockColumns,
      keyField: 'id',
      initialPageSize: 10,
      filterable: true,
    }));

    act(() => {
      result.current.setGlobalFilter('Product A');
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('Product A');
  });

  it('should sort data', () => {
    const { result } = renderHook(() => useDataTable({
      data: mockData,
      columns: mockColumns,
      keyField: 'id',
      initialPageSize: 10,
      sortable: true,
    }));

    act(() => {
      result.current.handleSort('name');
    });

    // Default is asc, so Product A, B, C
    expect(result.current.sortedData[0].name).toBe('Product A');

    act(() => {
      result.current.handleSort('name');
    });

    // Toggle to desc, so Product C, B, A
    expect(result.current.sortedData[0].name).toBe('Product C');
  });

  it('should manage row selection', () => {
    const { result } = renderHook(() => useDataTable({
      data: mockData,
      columns: mockColumns,
      keyField: 'id',
      initialPageSize: 10,
    }));

    act(() => {
      result.current.handleSelectRow(mockData[0]);
    });

    expect(result.current.selectedRows.has('1')).toBe(true);
    expect(result.current.selectedRows.size).toBe(1);

    act(() => {
      result.current.handleSelectAll();
    });

    expect(result.current.selectedRows.size).toBe(3);
  });

  it('should handle pagination', () => {
    const { result } = renderHook(() => useDataTable({
      data: mockData,
      columns: mockColumns,
      keyField: 'id',
      initialPageSize: 2,
      paginated: true,
    }));

    expect(result.current.paginatedData).toHaveLength(2);
    expect(result.current.totalPages).toBe(2);

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.paginatedData).toHaveLength(1);
  });
});
