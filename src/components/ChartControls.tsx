import React from 'react';
import { ChartConfig } from '../types';
import { BarChart, LineChart, PieChart, ScatterChart } from 'lucide-react';

interface ChartControlsProps {
  config: ChartConfig;
  columns: string[];
  onConfigChange: (config: ChartConfig) => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  config,
  columns,
  onConfigChange,
}) => {
  const chartTypes = [
    { type: 'line', icon: LineChart },
    { type: 'bar', icon: BarChart },
    { type: 'scatter', icon: ScatterChart },
    { type: 'pie', icon: PieChart },
  ];

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        {chartTypes.map(({ type, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onConfigChange({ ...config, type: type as ChartConfig['type'] })}
            className={`p-2 rounded ${
              config.type === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">X Axis</label>
          <select
            value={config.xAxis}
            onChange={(e) => onConfigChange({ ...config, xAxis: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Y Axis</label>
          <select
            value={config.yAxis}
            onChange={(e) => onConfigChange({ ...config, yAxis: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <input
            type="color"
            value={config.color}
            onChange={(e) => onConfigChange({ ...config, color: e.target.value })}
            className="mt-1 block w-full"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={config.showGrid}
              onChange={(e) => onConfigChange({ ...config, showGrid: e.target.checked })}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-2"
            />
            Show Grid
          </label>
        </div>
      </div>
    </div>
  );
};