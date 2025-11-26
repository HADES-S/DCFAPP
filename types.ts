export interface DCFInputs {
  symbol: string;
  currentPrice: number;
  freeCashFlow: number; // In Billions or Millions, but we will standardize to raw number
  growthRate: number; // Percentage (e.g., 15 for 15%)
  discountRate: number; // WACC (e.g., 10 for 10%)
  terminalGrowthRate: number; // Percentage (e.g., 2.5 for 2.5%)
  sharesOutstanding: number; // Raw number
  projectionYears: number;
}

export interface YearProjection {
  year: number;
  fcf: number;
  discountedFcf: number;
}

export interface DCFResult {
  projections: YearProjection[];
  terminalValue: number;
  presentTerminalValue: number;
  totalEnterpriseValue: number;
  intrinsicValuePerShare: number;
  upsideDownside: number;
  isUndervalued: boolean;
}

export interface AIAnalysisResponse {
  inputs: Partial<DCFInputs>;
  reasoning: string;
  sources: string[];
}
