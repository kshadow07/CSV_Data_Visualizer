export interface DataPoint {
  [key: string]: string | number;
}

export type ChartType = 'line' | 'bar' | 'scatter' | 'pie' | 'histogram';

export interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string;
  title: string;
  color: string;
  showGrid: boolean;
}