import React, { useState } from 'react';

interface DataPreviewProps {
  data: any[];
  columns: string[];
  onDataUpdate: (newData: any[]) => void;
  onRowDelete?: (index: number) => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, columns, onDataUpdate, onRowDelete }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const currentData = data.slice(startIndex, endIndex);

  const handleEdit = (rowIndex: number, column: string, value: any) => {
    setEditingCell({ row: rowIndex, column });
    setEditValue(value?.toString() || '');
  };

  const handleSave = (rowIndex: number, column: string) => {
    const newData = [...data];
    const actualRowIndex = startIndex + rowIndex;
    newData[actualRowIndex] = {
      ...newData[actualRowIndex],
      [column]: editValue
    };
    onDataUpdate(newData);
    setEditingCell(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, rowIndex: number, column: string) => {
    if (e.key === 'Enter') {
      handleSave(rowIndex, column);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto" style={{ width: '100%' }}>
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  style={{ minWidth: '150px' }}
                >
                  {column}
                </th>
              ))}
              {onRowDelete && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ minWidth: '150px' }}
                    onClick={() => handleEdit(rowIndex, column, row[column])}
                  >
                    {editingCell?.row === rowIndex && editingCell?.column === column ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSave(rowIndex, column)}
                        onKeyDown={(e) => handleKeyPress(e, rowIndex, column)}
                        className="w-full p-1 border rounded"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{row[column]?.toString() || ''}</span>
                    )}
                  </td>
                ))}
                {onRowDelete && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onRowDelete(startIndex + rowIndex)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{' '}
            <span className="font-medium">{data.length}</span> results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <span>First</span>
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <span>Previous</span>
          </button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= totalPages) {
                  setCurrentPage(value);
                }
              }}
              className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">of {totalPages}</span>
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <span>Next</span>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <span>Last</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;