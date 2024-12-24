import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell, Label, Brush,
} from 'recharts';
import { ChartConfig, DataPoint } from '../types';

interface ChartProps {
  data: DataPoint[];
  config: ChartConfig;
}

const COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a',
  '#14b8a6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Chart: React.FC<ChartProps> = ({ data, config }) => {
  const [brushStartIndex, setBrushStartIndex] = useState(0);
  const [brushEndIndex, setBrushEndIndex] = useState(data.length - 1);

  const handleBrushChange = (brushData: any) => {
    if (brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
      setBrushStartIndex(brushData.startIndex);
      setBrushEndIndex(brushData.endIndex);
    }
  };

  const commonProps = {
    data,
    margin: { top: 40, right: 40, left: 60, bottom: 40 },
  };

  const commonAxisProps = {
    tick: { fill: '#6b7280' },
    tickLine: { stroke: '#6b7280' },
    axisLine: { stroke: '#6b7280' },
  };

  const commonGridProps = {
    strokeDasharray: '3 3',
    stroke: '#e5e7eb',
  };

  const renderChart = () => {
    const addBrush = (chart: JSX.Element) => {
      return React.cloneElement(chart, {}, [
        ...React.Children.toArray(chart.props.children),
        <Brush
          key="brush"
          dataKey={config.xAxis}
          height={30}
          stroke="#8884d8"
          onChange={handleBrushChange}
          startIndex={brushStartIndex}
          endIndex={brushEndIndex}
        />
      ]);
    };

    switch (config.type) {
      case 'line':
      case 'bar':
      case 'scatter': {
        const ChartComponent = {
          line: LineChart,
          bar: BarChart,
          scatter: ScatterChart
        }[config.type];

        const DataComponent = {
          line: Line,
          bar: Bar,
          scatter: Scatter
        }[config.type];

        return addBrush(
          <ChartComponent {...commonProps}>
            {config.showGrid && <CartesianGrid {...commonGridProps} />}
            <XAxis
              dataKey={config.xAxis}
              {...commonAxisProps}
              padding={{ left: 20, right: 20 }}
            >
              <Label value={config.xAxis} position="bottom" offset={20} />
            </XAxis>
            <YAxis {...commonAxisProps}>
              <Label value={config.yAxis} angle={-90} position="left" offset={40} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <DataComponent
              name={config.yAxis}
              dataKey={config.yAxis}
              fill={config.color}
              stroke={config.color}
              strokeWidth={3}
              dot={config.type === 'line' ? { fill: config.color, strokeWidth: 2, r: 6 } : undefined}
              activeDot={config.type === 'line' ? { r: 8 } : undefined}
              radius={config.type === 'bar' ? [4, 4, 0, 0] : undefined}
              r={config.type === 'scatter' ? 8 : undefined}
            />
          </ChartComponent>
        );
      }

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data.slice(brushStartIndex, brushEndIndex + 1)}
              dataKey={config.yAxis}
              nameKey={config.xAxis}
              cx="50%"
              cy="50%"
              outerRadius={200}
              innerRadius={80}
              label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={true}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[600px] overflow-x-auto overflow-y-hidden">
      <div className="min-w-[800px] h-full">
        <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
      </div>
    </div>
  );
};