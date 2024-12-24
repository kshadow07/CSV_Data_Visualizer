import React, { useState } from 'react';
import { ChartConfig } from '../types';
import { 
  BarChart, 
  LineChart, 
  AreaChart,
  Loader2
} from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const chartTypes = [
    { type: 'line', icon: LineChart, label: 'Line Chart' },
    { type: 'bar', icon: BarChart, label: 'Bar Chart' },
    { type: 'area', icon: AreaChart, label: 'Area Chart' },
  ];

  const handleApply = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      onConfigChange(config);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
        <div className="grid grid-cols-3 gap-2">
          {chartTypes.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => onConfigChange({ ...config, type: type as ChartConfig['type'] })}
              className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
                config.type === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">X Axis</label>
          <select
            value={config.xAxis}
            onChange={(e) => onConfigChange({ ...config, xAxis: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Y Axis</label>
          <select
            value={config.yAxis}
            onChange={(e) => onConfigChange({ ...config, yAxis: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onConfigChange({ ...config, title: e.target.value })}
          placeholder="Enter chart title"
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showGrid"
          checked={config.showGrid}
          onChange={(e) => onConfigChange({ ...config, showGrid: e.target.checked })}
          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        />
        <label htmlFor="showGrid" className="text-sm font-medium text-gray-700">
          Show Grid Lines
        </label>
      </div>

      <button
        onClick={handleApply}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Applying Changes...</span>
          </>
        ) : (
          <span>Apply Changes</span>
        )}
      </button>
    </div>
  );
};