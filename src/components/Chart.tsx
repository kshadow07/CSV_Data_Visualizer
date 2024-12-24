import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartProps {
  data: DataPoint[];
  config: ChartConfig;
}

interface DataPoint {
  [key: string]: any;
}

interface ChartConfig {
  type: 'line' | 'bar' | 'area';
  xAxis: string;
  yAxis: string;
  title?: string;
  color?: string;
  showGrid?: boolean;
}

const Chart: React.FC<ChartProps> = ({ data, config }) => {
  const chartColor = config.color || "#4f46e5";
  const [visiblePoints, setVisiblePoints] = useState(50); // Default to showing 50 points
  const [startIndex, setStartIndex] = useState(0); // Always start from the newest data
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartKey, setChartKey] = useState(0);

  // Update startIndex and force re-render when data changes
  useEffect(() => {
    setStartIndex(0);
    setChartKey(prev => prev + 1); // Force re-render
  }, [data]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setVisiblePoints(Math.max(10, Math.min(data.length, newValue)));
  };

  const handleNavigationButton = (direction: 'left' | 'right') => {
    const step = Math.max(1, Math.floor(visiblePoints * 0.5)); // Move by half the visible range
    if (direction === 'left') {
      // Left shows newer data
      setStartIndex(Math.max(0, startIndex - step));
    } else {
      // Right shows older data
      setStartIndex(Math.min(data.length - visiblePoints, startIndex + step));
    }
  };

  const renderTitle = () => (
    config.title && (
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
        <p className="text-sm text-gray-500">{`${config.xAxis} - ${config.yAxis}`}</p>
      </div>
    )
  );

  const renderControls = () => (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
        <button
          onClick={() => handleNavigationButton('left')}
          className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            startIndex <= 0
            ? 'text-gray-300 bg-gray-100 cursor-not-allowed' 
            : 'text-blue-500 hover:bg-blue-50 active:bg-blue-100'
          }`}
          disabled={startIndex <= 0}
          title="Newer"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-5 h-5"
          >
            <path 
              fillRule="evenodd" 
              d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>

        <div className="flex-1 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Points:</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="10"
              max={data.length}
              value={visiblePoints}
              onChange={handleSliderChange}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${(visiblePoints / data.length) * 100}%, #e5e7eb ${(visiblePoints / data.length) * 100}%)`
              }}
            />
            <div className="absolute -top-6 left-0 w-full flex justify-center">
              <span className="text-sm font-medium text-gray-700 bg-white px-2 py-0.5 rounded-lg shadow-sm border">
                {visiblePoints}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleNavigationButton('right')}
          className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            startIndex >= data.length - visiblePoints
            ? 'text-gray-300 bg-gray-100 cursor-not-allowed' 
            : 'text-blue-500 hover:bg-blue-50 active:bg-blue-100'
          }`}
          disabled={startIndex >= data.length - visiblePoints}
          title="Older"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-5 h-5"
          >
            <path 
              fillRule="evenodd" 
              d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            setVisiblePoints(Math.min(20, data.length));
            setStartIndex(0);
          }}
          className="px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          Last 20
        </button>
        <button
          onClick={() => {
            setVisiblePoints(Math.min(50, data.length));
            setStartIndex(0);
          }}
          className="px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          Last 50
        </button>
        <button
          onClick={() => {
            setVisiblePoints(Math.min(100, data.length));
            setStartIndex(0);
          }}
          className="px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          Last 100
        </button>
        <button
          onClick={() => {
            setVisiblePoints(data.length);
            setStartIndex(0);
          }}
          className="px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          All
        </button>
      </div>
    </div>
  );

  const renderChart = () => {
    const commonProps = {
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
      key: chartKey, // Add key to force re-render
    };

    // Get the data slice but don't reverse it - this will show oldest on left, newest on right
    const visibleData = data.slice(startIndex, startIndex + visiblePoints);

    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={visibleData} {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey={config.xAxis}
                height={40}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey={config.yAxis}
                stroke={chartColor}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={visibleData} {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey={config.xAxis}
                height={40}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Bar dataKey={config.yAxis} fill={chartColor} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={visibleData} {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey={config.xAxis}
                height={40}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey={config.yAxis}
                stroke={chartColor}
                fill={chartColor}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderTitle()}
      {renderControls()}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart;