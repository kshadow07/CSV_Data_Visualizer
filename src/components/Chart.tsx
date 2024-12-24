import React, { useEffect, useRef, useState } from 'react';
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
  onExport?: (format: 'png' | 'jpeg' | 'pdf') => Promise<void>;
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

const Chart: React.FC<ChartProps> = ({ data, config, onExport }) => {
  const chartColor = config.color || "#4f46e5";
  const [visiblePoints, setVisiblePoints] = useState(50);
  const [startIndex, setStartIndex] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartKey, setChartKey] = useState(0);
  const maxPoints = data.length;

  useEffect(() => {
    setStartIndex(0);
    setVisiblePoints(Math.min(50, data.length));
    setChartKey(prev => prev + 1);
  }, [data]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      const points = Math.max(10, Math.min(maxPoints, newValue));
      setVisiblePoints(points);
      // Adjust startIndex if needed to keep the visible range within bounds
      if (startIndex + points > maxPoints) {
        setStartIndex(Math.max(0, maxPoints - points));
      }
    }
  };

  const handleNavigationButton = (direction: 'left' | 'right') => {
    const step = Math.max(1, Math.floor(visiblePoints * 0.5));
    if (direction === 'left') {
      setStartIndex(Math.max(0, startIndex - step));
    } else {
      setStartIndex(Math.min(maxPoints - visiblePoints, startIndex + step));
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
          <span className="text-sm font-medium text-gray-700">Points: {visiblePoints}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min={10}
              max={maxPoints}
              step={1}
              value={visiblePoints}
              onChange={handleSliderChange}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${(visiblePoints / maxPoints) * 100}%, #e5e7eb ${(visiblePoints / maxPoints) * 100}%)`
              }}
            />
            <div className="absolute -top-6 left-0 w-full flex justify-center">
              <span className="text-sm font-medium text-gray-700 bg-white px-2 py-0.5 rounded-lg shadow-sm border">
                {visiblePoints} / {maxPoints}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleNavigationButton('right')}
          className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            startIndex >= maxPoints - visiblePoints
            ? 'text-gray-300 bg-gray-100 cursor-not-allowed' 
            : 'text-blue-500 hover:bg-blue-50 active:bg-blue-100'
          }`}
          disabled={startIndex >= maxPoints - visiblePoints}
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
      key: chartKey, 
    };

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
    <div className="space-y-4">
      {renderTitle()}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {onExport && (
            <button
              onClick={() => onExport('png')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export as PNG
            </button>
          )}
        </div>
      </div>
      <div 
        ref={chartRef}
        data-chart-container
        className="bg-white p-4 rounded-lg"
      >
        {renderChart()}
      </div>
      {renderControls()}
    </div>
  );
};

export default Chart;