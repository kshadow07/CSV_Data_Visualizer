export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  equation: string;
  predictedValues: number[];
  correlation: number;
  standardError: number;
  points: Array<{ x: number; y: number }>;
}

export interface RegressionConfig {
  enabled: boolean;
  xAxis?: string;
  yAxis?: string;
  transformationType?: 'none' | 'log' | 'sqrt' | 'square';
}
