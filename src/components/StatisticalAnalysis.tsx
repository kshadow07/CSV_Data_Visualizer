import React, { useState } from 'react';
import { jStat } from 'jstat'; // For statistical calculations

interface StatisticalAnalysisProps {
  data: any[];
  originalData: any[];
  columns: string[];
  onTransformedDataChange?: (newData: any[]) => void;
}

type TransformationType = 'none' | 'log' | 'standardize' | 'normalize' | 'minmax';
type TestType = 'ttest' | 'chiSquare' | 'correlation';

interface TestResult {
  testName: string;
  result: number;
  pValue: number;
  description: string;
}

const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({ data, originalData, columns, onTransformedDataChange }) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [transformation, setTransformation] = useState<TransformationType>('none');
  const [testType, setTestType] = useState<TestType>('ttest');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [groupByColumn, setGroupByColumn] = useState<string>('');
  const [pivotMetric, setPivotMetric] = useState<string>('count');
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransformationView, setIsTransformationView] = useState(false);
  const rowsPerPage = 15;

  // Enhanced Data Transformations
  const transformData = (column: string, type: TransformationType) => {
    setIsTransformationView(true);
    try {
      const newData = data.map(row => {
        const newRow = { ...row };
        const value = parseFloat(row[column]);
        
        switch (type) {
          case 'log':
            newRow[column] = value > 0 ? Math.log(value) : Math.log(0.0001);
            break;
          case 'standardize': {
            const values = data.map(r => parseFloat(r[column]));
            const mean = jStat.mean(values);
            const std = jStat.stdev(values, true);
            newRow[column] = (value - mean) / (std || 1);
            break;
          }
          case 'normalize': {
            const values = data.map(r => parseFloat(r[column]));
            const sum = jStat.sum(values);
            newRow[column] = sum !== 0 ? value / sum : 0;
            break;
          }
          case 'minmax': {
            const values = data.map(r => parseFloat(r[column]));
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            newRow[column] = range !== 0 ? (value - min) / range : 0;
            break;
          }
        }
        return newRow;
      });

      if (onTransformedDataChange) {
        onTransformedDataChange(newData);
      }
    } catch (error) {
      console.error('Error transforming data:', error);
      alert('Error transforming data. Please check the values and try again.');
    }
  };

  const resetTransformation = () => {
    setIsTransformationView(false);
    setTransformation('none');
    setSelectedColumns([]);
    setTestType('ttest');
    setTestResults([]);
    setGroupByColumn('');
    setPivotMetric('count');
    setCurrentPage(1);
    
    if (onTransformedDataChange && originalData) {
      // Create a deep copy with exact numeric values preserved
      const resetData = originalData.map(row => {
        const newRow = { ...row };
        // Ensure numeric values are preserved exactly
        Object.keys(row).forEach(key => {
          if (typeof row[key] === 'number') {
            newRow[key] = Number(row[key]);
          }
        });
        return newRow;
      });
      onTransformedDataChange(resetData);
    }
  };

  // Enhanced Statistical Tests
  const runStatisticalTest = () => {
    if (selectedColumns.length < 1) {
      alert('Please select at least one column for analysis');
      return;
    }

    const results: TestResult[] = [];
    const values1 = data.map(row => parseFloat(row[selectedColumns[0]]));

    try {
      switch (testType) {
        case 'ttest': {
          if (selectedColumns.length === 2) {
            const values2 = data.map(row => parseFloat(row[selectedColumns[1]]));
            // Two-sample t-test
            const ttest = jStat.ttest(values1, values2);
            const pValue = jStat.ttest(values1, values2, true);
            results.push({
              testName: 'Two-Sample T-Test',
              result: ttest,
              pValue: pValue,
              description: `T-test comparing ${selectedColumns[0]} and ${selectedColumns[1]}`
            });
          } else {
            // One-sample t-test against mean = 0
            const ttest = jStat.ttest(values1, 0);
            const pValue = jStat.ttest(values1, 0, true);
            results.push({
              testName: 'One-Sample T-Test',
              result: ttest,
              pValue: pValue,
              description: `T-test for ${selectedColumns[0]} against μ=0`
            });
          }
          break;
        }
        case 'chiSquare': {
          // Perform chi-square test of independence
          const frequencies = calculateFrequencies(selectedColumns);
          const { chiSquare, pValue } = performChiSquareTest(frequencies);
          results.push({
            testName: 'Chi-Square Test',
            result: chiSquare,
            pValue: pValue,
            description: `Chi-square test of independence between selected columns`
          });
          break;
        }
        case 'correlation': {
          if (selectedColumns.length === 2) {
            const values2 = data.map(row => parseFloat(row[selectedColumns[1]]));
            const correlation = jStat.corrcoeff(values1, values2);
            results.push({
              testName: 'Pearson Correlation',
              result: correlation,
              pValue: calculateCorrelationPValue(correlation, values1.length),
              description: `Correlation between ${selectedColumns[0]} and ${selectedColumns[1]}`
            });
          }
          break;
        }
      }

      setTestResults(results);
    } catch (error) {
      console.error('Error running statistical test:', error);
      alert('Error running statistical test. Please ensure the data is valid for the selected test.');
    }
  };

  // Helper function for chi-square test
  const calculateFrequencies = (columns: string[]) => {
    const frequencies: { [key: string]: { [key: string]: number } } = {};
    data.forEach(row => {
      const val1 = row[columns[0]].toString();
      const val2 = columns[1] ? row[columns[1]].toString() : 'count';
      
      if (!frequencies[val1]) frequencies[val1] = {};
      if (!frequencies[val1][val2]) frequencies[val1][val2] = 0;
      frequencies[val1][val2]++;
    });
    return frequencies;
  };

  // Helper function for chi-square test
  const performChiSquareTest = (frequencies: { [key: string]: { [key: string]: number } }) => {
    let chiSquare = 0;
    let degreesOfFreedom = 0;
    let totalSum = 0;

    // Calculate row and column totals
    const rowTotals: { [key: string]: number } = {};
    const colTotals: { [key: string]: number } = {};

    Object.keys(frequencies).forEach(row => {
      Object.keys(frequencies[row]).forEach(col => {
        const value = frequencies[row][col];
        totalSum += value;
        rowTotals[row] = (rowTotals[row] || 0) + value;
        colTotals[col] = (colTotals[col] || 0) + value;
      });
    });

    // Calculate chi-square statistic
    Object.keys(frequencies).forEach(row => {
      Object.keys(frequencies[row]).forEach(col => {
        const observed = frequencies[row][col];
        const expected = (rowTotals[row] * colTotals[col]) / totalSum;
        chiSquare += Math.pow(observed - expected, 2) / expected;
      });
    });

    degreesOfFreedom = (Object.keys(rowTotals).length - 1) * (Object.keys(colTotals).length - 1);
    const pValue = 1 - jStat.chisquare.cdf(chiSquare, degreesOfFreedom);

    return { chiSquare, pValue };
  };

  // Helper function for correlation p-value
  const calculateCorrelationPValue = (correlation: number, n: number) => {
    const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    return 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));
  };

  // Enhanced Pivot Table calculation
  const calculatePivotTable = () => {
    if (!groupByColumn || !data || data.length === 0) return null;

    const pivotData: { [key: string]: any } = {};
    
    try {
      data.forEach(row => {
        if (!row || !row[groupByColumn]) return;

        const groupValue = row[groupByColumn].toString();
        if (!pivotData[groupValue]) {
          pivotData[groupValue] = {
            count: 0,
            sum: 0,
            values: []
          };
        }

        const group = pivotData[groupValue];
        group.count++;

        // Handle numeric values for additional metrics
        const numericColumns = columns.filter(col => 
          row[col] !== undefined && row[col] !== null && !isNaN(parseFloat(row[col]))
        );

        numericColumns.forEach(col => {
          const value = parseFloat(row[col]);
          if (!group[col]) {
            group[col] = {
              sum: 0,
              values: []
            };
          }
          group[col].sum += value;
          group[col].values.push(value);
        });
      });

      // Calculate additional statistics
      Object.values(pivotData).forEach((group: any) => {
        Object.keys(group).forEach(col => {
          if (col !== 'count' && col !== 'values') {
            const values = group[col].values;
            if (values && values.length > 0) {
              group[col].mean = group[col].sum / values.length;
              group[col].median = jStat.median(values);
              group[col].std = values.length > 1 ? jStat.stdev(values, true) : 0;
            }
          }
        });
      });

      return pivotData;
    } catch (error) {
      console.error('Error calculating pivot table:', error);
      return null;
    }
  };

  // Calculate total pages
  const pivotData = calculatePivotTable() ?? {};
  const totalRows = Object.keys(pivotData).length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Get current rows
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return Object.entries(pivotData).slice(startIndex, endIndex);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get visible page numbers
  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="space-y-6">
      {/* Data Transformation Section */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Data Transformation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Select Column</label>
            <select
              className="w-full form-select px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-blue-300 text-sm"
              value={selectedColumns[0] || ''}
              onChange={(e) => setSelectedColumns([e.target.value])}
            >
              <option value="">Select Column</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Transformation Type</label>
            <select
              className="w-full form-select px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-blue-300 text-sm"
              value={transformation}
              onChange={(e) => setTransformation(e.target.value as TransformationType)}
            >
              <option value="none">No Transformation</option>
              <option value="log">Log Transform</option>
              <option value="standardize">Standardize (Z-score)</option>
              <option value="normalize">Normalize (0-1)</option>
              <option value="minmax">Min-Max Scaling</option>
            </select>
          </div>
          <div className="flex gap-2 sm:justify-end">
            <button
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm font-medium"
              onClick={() => {
                if (!selectedColumns[0]) {
                  alert('Please select a column to transform');
                  return;
                }
                if (transformation === 'none') {
                  alert('Please select a transformation type');
                  return;
                }
                transformData(selectedColumns[0], transformation);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Apply
            </button>
            {isTransformationView && (
              <button
                className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm font-medium"
                onClick={resetTransformation}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pivot Table Section */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Pivot Table
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Group By Column</label>
            <select
              className="w-full form-select px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-blue-300 text-sm"
              value={groupByColumn}
              onChange={(e) => setGroupByColumn(e.target.value)}
            >
              <option value="">Select Column</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Metric</label>
            <select
              className="w-full form-select px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-blue-300 text-sm"
              value={pivotMetric}
              onChange={(e) => setPivotMetric(e.target.value)}
            >
              <option value="count">Count</option>
              <option value="sum">Sum</option>
              <option value="mean">Mean</option>
              <option value="median">Median</option>
              <option value="std">Standard Deviation</option>
            </select>
          </div>
        </div>

        {groupByColumn && (
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{groupByColumn}</th>
                    {columns.filter(col => data[0] && !isNaN(parseFloat(data[0][col]))).map(col => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {`${col} (${pivotMetric})`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentPageData().map(([key, values]: [string, any], index) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{key}</td>
                      {columns.filter(col => data[0] && !isNaN(parseFloat(data[0][col]))).map(col => (
                        <td key={col} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {values[col] ? 
                            (pivotMetric === 'count' ? values[col].count :
                             pivotMetric === 'sum' ? values[col].sum.toFixed(2) :
                             pivotMetric === 'mean' ? values[col].mean.toFixed(2) :
                             pivotMetric === 'median' ? values[col].median.toFixed(2) :
                             values[col].std.toFixed(2)) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    currentPage === 1
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {getVisiblePageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className="px-3 py-1 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(Number(pageNum))}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    currentPage === totalPages
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistical Tests Section */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Statistical Tests
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Test Type</label>
            <select
              className="w-full form-select px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-blue-300 text-sm"
              value={testType}
              onChange={(e) => setTestType(e.target.value as TestType)}
            >
              <option value="ttest">T-Test</option>
              <option value="chiSquare">Chi-Square Test</option>
              <option value="correlation">Correlation Analysis</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Select Columns</label>
            <select
              multiple
              className="w-full form-multiselect px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-blue-300 text-sm"
              value={selectedColumns}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedColumns(selected);
              }}
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm font-medium"
          onClick={runStatisticalTest}
        >
          Run Test
        </button>

        {testResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{result.testName}</h4>
                <p className="text-sm text-gray-600">{result.description}</p>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Result:</span>
                    <span className="ml-2 text-sm text-gray-900">{result.result.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">P-Value:</span>
                    <span className="ml-2 text-sm text-gray-900">{result.pValue.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticalAnalysis;