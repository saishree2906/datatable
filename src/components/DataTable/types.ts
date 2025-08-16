import React from "react";

export interface Column<T extends Record<string, any>> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string; // optional for layout (e.g., "w-40")
}

export interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean; // multi-select
  onRowSelect?: (selectedRows: T[]) => void;
  emptyMessage?: string;
  rowClassName?: (row: T, index: number) => string | undefined;
  getRowId?: (row: T, index: number) => string | number; // stable selection keys
}
