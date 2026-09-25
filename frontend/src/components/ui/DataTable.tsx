import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  searchPlaceholder = 'Search...',
  onSearch,
  onAdd,
  addLabel = 'Add New'
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col w-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent-red)] focus:ring-1 focus:ring-[var(--accent-red)] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors">
            <Download size={16} /> Export
          </button>
          {onAdd && (
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent-red)] rounded-lg hover:bg-[var(--accent-red-hover)] transition-colors shadow-sm"
            >
              + {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
              <th className="p-4 w-12 text-center">
                <input type="checkbox" className="rounded border-[var(--border-color)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]" />
              </th>
              {columns.map((col, idx) => (
                <th key={idx} className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-color)]/30 transition-colors group">
                  <td className="p-4 text-center">
                    <input type="checkbox" className="rounded border-[var(--border-color)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]" />
                  </td>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-4 text-sm text-[var(--text-primary)]">
                      {col.cell 
                        ? col.cell(row) 
                        : col.accessorKey 
                          ? String((row as any)[col.accessorKey] || '') 
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-[var(--text-secondary)]">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-color)]/20">
        <span className="text-sm text-[var(--text-secondary)]">
          Showing <span className="font-medium text-[var(--text-primary)]">1</span> to <span className="font-medium text-[var(--text-primary)]">{data.length}</span> of <span className="font-medium text-[var(--text-primary)]">{data.length}</span> entries
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)] disabled:opacity-50" disabled>
            <ChevronLeft size={20} />
          </button>
          <button className="px-3 py-1 rounded bg-[var(--accent-red)] text-white text-sm font-medium">1</button>
          <button className="px-3 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-color)] text-sm font-medium">2</button>
          <button className="px-3 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-color)] text-sm font-medium">3</button>
          <button className="p-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)]">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
