import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { DataPoint } from '../../types';

interface DataTableProps {
  data: DataPoint[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  sortColumn,
  sortDirection,
  onSort,
}) => {
  if (!data.length) return null;
  const headers = Object.keys(data[0]);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ minWidth: '1500px' }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                onClick={() => onSort(header)}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{header}</span>
                  {sortColumn === header ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4 text-blue-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-blue-500" />
                    )
                  ) : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={index}
              style={{ 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}
            >
              {headers.map((header) => (
                <td
                  key={`${index}-${header}`}
                  style={{
                    padding: '12px',
                    whiteSpace: 'nowrap',
                    minWidth: '150px'
                  }}
                >
                  {row[header]?.toString() || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};