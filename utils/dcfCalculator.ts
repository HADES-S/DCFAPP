import { DCFInputs, DCFResult, YearProjection } from '../types';

export const calculateDCF = (inputs: DCFInputs): DCFResult => {
  const {
    freeCashFlow,
    growthRate,
    discountRate,
    terminalGrowthRate,
    sharesOutstanding,
    projectionYears,
    currentPrice
  } = inputs;

  const projections: YearProjection[] = [];
  const r = discountRate / 100;
  const g = growthRate / 100;
  const tg = terminalGrowthRate / 100;

  let currentFcf = freeCashFlow;
  let sumDiscountedFcf = 0;

  // Calculate explicit projection period
  for (let i = 1; i <= projectionYears; i++) {
    currentFcf = currentFcf * (1 + g);
    const discountedFcf = currentFcf / Math.pow(1 + r, i);
    
    sumDiscountedFcf += discountedFcf;
    
    projections.push({
      year: i,
      fcf: currentFcf,
      discountedFcf: discountedFcf
    });
  }

  // Calculate Terminal Value
  // TV = (Final Year FCF * (1 + tg)) / (r - tg)
  const finalYearFcf = projections[projections.length - 1].fcf;
  
  // Guard against division by zero or negative denominator if r <= tg
  // In reality, r should be > tg. If not, the model breaks (infinite value).
  // We'll clamp the denominator to a small positive number if needed, or handle gracefully.
  let denominator = r - tg;
  if (denominator <= 0.001) denominator = 0.001; 

  const terminalValue = (finalYearFcf * (1 + tg)) / denominator;
  const presentTerminalValue = terminalValue / Math.pow(1 + r, projectionYears);

  const totalEnterpriseValue = sumDiscountedFcf + presentTerminalValue;
  
  // Intrinsic Value per Share
  // If sharesOutstanding is 0, avoid Infinity
  const intrinsicValuePerShare = sharesOutstanding > 0 
    ? totalEnterpriseValue / sharesOutstanding 
    : 0;

  const upsideDownside = currentPrice > 0 
    ? ((intrinsicValuePerShare - currentPrice) / currentPrice) * 100
    : 0;

  return {
    projections,
    terminalValue,
    presentTerminalValue,
    totalEnterpriseValue,
    intrinsicValuePerShare,
    upsideDownside,
    isUndervalued: intrinsicValuePerShare > currentPrice
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
};
