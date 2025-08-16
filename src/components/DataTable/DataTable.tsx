import React from "react";
import type { DataTableProps} from "./types";

type SortOrder = "asc" | "desc";

function defaultGetRowId<T>(_: T, index: number) {
  return index;
}

function compareValues(a: any, b: any): number {
  // smart-ish comparator: numbers, dates, strings
  const aVal = a ?? "";
  const bVal = b ?? "";
  const aNum = typeof aVal === "number" ? aVal : Number.isNaN(+aVal) ? null : +aVal;
  const bNum = typeof bVal === "number" ? bVal : Number.isNaN(+bVal) ? null : +bVal;

  // numbers > dates > strings fallback
  if (aNum !== null && bNum !== null) return aNum - bNum;

  const aDate = new Date(aVal);
  const bDate = new Date(bVal);
  if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime()))
    return aDate.getTime() - bDate.getTime();

  return String(aVal).localeCompare(String(bVal));
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  selectable = false,
  onRowSelect,
  emptyMessage = "No data available",
  rowClassName,
  getRowId = defaultGetRowId,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());

  const toggleAll = () => {
    if (!selectable) return;
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
      onRowSelect?.([]);
    } else {
      const all = new Set(data.map((row, idx) => getRowId(row, idx)));
      setSelectedIds(all);
      onRowSelect?.(data.slice());
    }
  };

  const toggleOne = (row: T, idx: number) => {
    if (!selectable) return;
    const id = getRowId(row, idx);
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
    onRowSelect?.(data.filter((r, i) => next.has(getRowId(r, i))));
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const clone = [...data];
    clone.sort((a, b) => {
      const diff = compareValues(a[sortKey], b[sortKey]);
      return sortOrder === "asc" ? diff : -diff;
    });
    return clone;
  }, [data, sortKey, sortOrder]);

  const isAllSelected = selectable && data.length > 0 && selectedIds.size === data.length;

  if (loading) {
    // simple skeleton
    return (
      <div
        role="status"
        aria-busy="true"
        className="w-full border border-gray-200 rounded-lg p-4 space-y-2"
      >
        <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table
        role="table"
        aria-rowcount={sortedData.length}
        className="w-full border border-gray-200 rounded-lg overflow-hidden"
      >
        <thead className="bg-gray-50" role="rowgroup">
          <tr role="row">
            {selectable && (
              <th role="columnheader" className="p-3 w-12 text-center align-middle">
                <input
                  aria-label={isAllSelected ? "Deselect all rows" : "Select all rows"}
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col) => {
              const active = sortKey === col.key;
              const canSort = !!col.sortable;
              return (
                <th
                  key={String(col.key)}
                  role="columnheader"
                  scope="col"
                  className={[
                    "p-3 text-left text-sm font-semibold text-gray-700 select-none",
                    canSort ? "cursor-pointer hover:bg-gray-100" : "",
                    col.width ?? "",
                  ].join(" ")}
                  onClick={() => {
                    if (!canSort) return;
                    if (active) {
                      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                    } else {
                      setSortKey(col.key);
                      setSortOrder("asc");
                    }
                  }}
                  aria-sort={
                    !canSort ? undefined : active ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
                  }
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {canSort && (
                      <span className="text-xs text-gray-500">
                        {active ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {sortedData.map((row, idx) => {
            const id = getRowId(row, idx);
            const selected = selectedIds.has(id);
            return (
              <tr
                key={String(id)}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (!selectable) return;
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    toggleOne(row, idx);
                  }
                }}
                className={[
                  "border-t last:border-b hover:bg-gray-50 focus:outline-none",
                  selected ? "bg-blue-50" : "bg-white",
                  rowClassName?.(row, idx) ?? "",
                ].join(" ")}
              >
                {selectable && (
                  <td role="cell" className="p-3 w-12 text-center align-middle">
                    <input
                      aria-label={selected ? "Deselect row" : "Select row"}
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleOne(row, idx)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={String(col.key)} role="cell" className="p-3 text-sm text-gray-800">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
