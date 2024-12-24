export interface DataPoint {
  [key: string]: string | number;
}

export type ChartType = 
  | 'line'
  | 'bar'
  | 'area';

export interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string;
  title: string;
  color: string;
  showGrid: boolean;
  // Additional properties for specific chart types
  size?: string; // For bubble charts
  category?: string; // For heatmap categorization
}
