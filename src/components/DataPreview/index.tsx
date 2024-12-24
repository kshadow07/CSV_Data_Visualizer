import React, { useState, useMemo } from 'react';
import { DataPoint } from '../../types';
import { DataTable } from './DataTable';
import { Pagination } from './Pagination';

interface DataPreviewProps {
  data: DataPoint[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const rowsPerPage = 10;

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
      <DataTable
        data={paginatedData}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      <div className="mt-4 flex flex-col items-center space-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <div className="text-sm text-gray-500">
          Showing rows {startIndex + 1} to {Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length} total rows
        </div>
      </div>
    </div>
  );
};