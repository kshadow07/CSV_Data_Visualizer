import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { RegressionResult } from '../types/regression';

interface RegressionAnalysisProps {
  data: any[];
  selectedXColumn: string;
  selectedYColumn: string;
}

// Utility functions for regression calculations
const calculateMean = (values: number[]): number => {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const calculateSlope = (x: number[], y: number[]): number => {
  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
    denominator += Math.pow(x[i] - meanX, 2);
  }
  
  return numerator / denominator;
};

const calculateIntercept = (x: number[], y: number[], slope: number): number => {
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  return meanY - slope * meanX;
};

const calculateRSquared = (x: number[], y: number[], slope: number, intercept: number): number => {
  const meanY = calculateMean(y);
  const predictedY = x.map(xi => slope * xi + intercept);
  
  const ssTotal = y.reduce((acc, yi) => acc + Math.pow(yi - meanY, 2), 0);
  const ssResidual = y.reduce((acc, yi, i) => acc + Math.pow(yi - predictedY[i], 2), 0);
  
  return 1 - (ssResidual / ssTotal);
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  
  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
    denominatorX += Math.pow(x[i] - meanX, 2);
    denominatorY += Math.pow(y[i] - meanY, 2);
  }
  
  return numerator / Math.sqrt(denominatorX * denominatorY);
};

const calculateStandardError = (x: number[], y: number[], slope: number, intercept: number): number => {
  const n = x.length;
  const predictedY = x.map(xi => slope * xi + intercept);
  const ssResidual = y.reduce((acc, yi, i) => acc + Math.pow(yi - predictedY[i], 2), 0);
  return Math.sqrt(ssResidual / (n - 2));
};

const parseValue = (value: any): number | null => {
  if (typeof value === 'string') {
    // Remove any currency symbols, commas, and spaces
    const cleanValue = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  }
  return typeof value === 'number' ? value : null;
};

const calculateRegression = (data: { x: number; y: number }[]): RegressionResult => {
  const x = data.map(p => p.x);
  const y = data.map(p => p.y);

  const slope = calculateSlope(x, y);
  const intercept = calculateIntercept(x, y, slope);
  const rSquared = calculateRSquared(x, y, slope, intercept);
  const correlation = calculateCorrelation(x, y);
  const standardError = calculateStandardError(x, y, slope, intercept);

  // Generate points for the regression line
  const minX = Math.min(...x);
  const maxX = Math.max(...x);
  const step = (maxX - minX) / 100;
  const regressionPoints = Array.from({ length: 101 }, (_, i) => {
    const xVal = minX + step * i;
    return { x: xVal, y: slope * xVal + intercept };
  });

  return {
    slope,
    intercept,
    rSquared,
    equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
    predictedValues: x.map(xi => slope * xi + intercept),
    correlation,
    standardError,
    points: regressionPoints
  };
};

export const RegressionAnalysis: React.FC<RegressionAnalysisProps> = ({
  data,
  selectedXColumn,
  selectedYColumn,
}) => {
  const [processedData, setProcessedData] = useState<Array<{ x: number; y: number }>>([]);
  const [regressionResult, setRegressionResult] = useState<RegressionResult>({
    slope: 0,
    intercept: 0,
    rSquared: 0,
    correlation: 0,
    standardError: 0,
    points: [],
    equation: 'y = 0x + 0',
    predictedValues: []
  });

  // Add range state
  const [xRange, setXRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [yRange, setYRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [currentXRange, setCurrentXRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [currentYRange, setCurrentYRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

  useEffect(() => {
    if (data && data.length > 0 && selectedXColumn && selectedYColumn) {
      try {
        console.log('Processing data for regression:', {
          dataLength: data.length,
          xColumn: selectedXColumn,
          yColumn: selectedYColumn,
          sampleData: data.slice(0, 3)
        });

        const processedPoints = data
          .map(item => ({
            x: parseValue(item[selectedXColumn]) ?? 0,
            y: parseValue(item[selectedYColumn]) ?? 0
          }))
          .filter(point => !isNaN(point.x) && !isNaN(point.y));

        // Set initial ranges
        const xValues = processedPoints.map(p => p.x);
        const yValues = processedPoints.map(p => p.y);
        const newXRange = {
          min: Math.min(...xValues),
          max: Math.max(...xValues)
        };
        const newYRange = {
          min: Math.min(...yValues),
          max: Math.max(...yValues)
        };
        setXRange(newXRange);
        setYRange(newYRange);
        setCurrentXRange(newXRange);
        setCurrentYRange(newYRange);

        setProcessedData(processedPoints);

        console.log('Processed data:', {
          originalLength: data.length,
          processedLength: processedPoints.length,
          sampleProcessed: processedPoints.slice(0, 3)
        });
      } catch (error) {
        console.error('Error processing data:', error);
      }
    }
  }, [data, selectedXColumn, selectedYColumn]);

  useEffect(() => {
    if (processedData.length > 0) {
      try {
        // Filter data based on current ranges
        const filteredData = processedData.filter(point => 
          point.x >= currentXRange.min && 
          point.x <= currentXRange.max && 
          point.y >= currentYRange.min && 
          point.y <= currentYRange.max
        );

        console.log('Calculating regression for:', {
          xPoints: filteredData.map(p => p.x).slice(0, 3),
          yPoints: filteredData.map(p => p.y).slice(0, 3),
          totalPoints: filteredData.length
        });

        const result = calculateRegression(filteredData);
        setRegressionResult(result);

        console.log('Initial calculations:', {
          slope: result.slope,
          intercept: result.intercept,
          rSquared: result.rSquared,
          correlation: result.correlation
        });
      } catch (error) {
        console.error('Error calculating regression:', error);
      }
    }
  }, [processedData, currentXRange, currentYRange]);

  if (!data?.length) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-700">No data available for regression analysis.</p>
      </div>
    );
  }

  if (!selectedXColumn || !selectedYColumn) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-700">Please select both X and Y columns for regression analysis.</p>
      </div>
    );
  }

  if (processedData.length < 2) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-700">
          Not enough valid numeric data points for regression analysis. Found {processedData.length} valid points in columns "{selectedXColumn}" and "{selectedYColumn}".
          Please ensure both columns contain valid numbers.
        </p>
      </div>
    );
  }

  if (!regressionResult) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-700">Unable to calculate regression. Please check your data.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Range Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
              {selectedXColumn} Range Control
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-blue-700 mb-1">Minimum Value</label>
              <input
                type="number"
                value={currentXRange.min}
                onChange={(e) => setCurrentXRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-700 mb-1">Maximum Value</label>
              <input
                type="number"
                value={currentXRange.max}
                onChange={(e) => setCurrentXRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="any"
              />
            </div>
            <button
              onClick={() => setCurrentXRange(xRange)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Range
            </button>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
              {selectedYColumn} Range Control
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-purple-700 mb-1">Minimum Value</label>
              <input
                type="number"
                value={currentYRange.min}
                onChange={(e) => setCurrentYRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm text-purple-700 mb-1">Maximum Value</label>
              <input
                type="number"
                value={currentYRange.max}
                onChange={(e) => setCurrentYRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                step="any"
              />
            </div>
            <button
              onClick={() => setCurrentYRange(yRange)}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Reset Range
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Statistics */}
        <div className="space-y-4">
          {/* Regression Title */}
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Regression Analysis</h2>
          </div>

          {/* Regression Equation */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow-sm">
            <h3 className="text-sm font-medium text-indigo-900 mb-2">Regression Equation</h3>
            <div className="p-3 bg-white/80 rounded-lg">
              <p className="font-mono text-sm text-gray-800">
                {selectedYColumn} = {regressionResult.slope.toFixed(4)} × {selectedXColumn} + {regressionResult.intercept.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* R² Card */}
            <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 shadow-sm">
              <h3 className="text-sm font-medium text-violet-900 mb-2">R² (Coefficient of Determination)</h3>
              <p className="text-2xl font-bold text-violet-700">{(regressionResult.rSquared * 100).toFixed(2)}%</p>
              <p className="text-xs text-violet-600 mt-1">
                {regressionResult.rSquared >= 0.7 ? 'Strong fit' : 
                 regressionResult.rSquared >= 0.5 ? 'Moderate fit' : 'Weak fit'}
              </p>
            </div>

            {/* Correlation Card */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100 shadow-sm">
              <h3 className="text-sm font-medium text-emerald-900 mb-2">Correlation</h3>
              <p className="text-2xl font-bold text-emerald-700">{regressionResult.correlation.toFixed(4)}</p>
              <p className="text-xs text-emerald-600 mt-1">
                {Math.abs(regressionResult.correlation) >= 0.7 ? 'Strong' :
                 Math.abs(regressionResult.correlation) >= 0.5 ? 'Moderate' : 'Weak'}
                {regressionResult.correlation > 0 ? ' positive' : ' negative'} correlation
              </p>
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Slope</h3>
              <p className="text-2xl font-bold text-gray-700">{regressionResult.slope.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Intercept</h3>
              <p className="text-2xl font-bold text-gray-700">{regressionResult.intercept.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={selectedXColumn}
                  domain={[currentXRange.min, currentXRange.max]}
                  label={{ value: selectedXColumn, position: 'bottom', offset: 20 }}
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={selectedYColumn}
                  domain={[currentYRange.min, currentYRange.max]}
                  label={{ value: selectedYColumn, angle: -90, position: 'left', offset: 20 }}
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any) => [value.toFixed(4)]}
                  labelFormatter={(value) => `${selectedXColumn}: ${value.toFixed(4)}`}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{
                    paddingTop: '10px',
                    fontSize: '14px'
                  }}
                />
                <Scatter
                  name="Data Points"
                  data={processedData}
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                  shape="circle"
                  r={3}
                />
                <Scatter
                  name="Regression Line"
                  data={regressionResult.points}
                  line={{ stroke: '#EF4444', strokeWidth: 2 }}
                  lineType="fitting"
                  shape={false}
                  legendType="line"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
