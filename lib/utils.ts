import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0';

  const absValue = Math.abs(value);
  let result: string;

  // For numbers >= 1, use toLocaleString for comma formatting
  if (absValue >= 1) {
    result = value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } else {
    // For small numbers, find first non-zero decimal place
    const firstNonZero = absValue.toFixed(10).match(/^0\.0*[1-9]/)?.[0]?.length ?? 2;
    const decimalPlaces = Math.min(Math.max(firstNonZero + 3, decimals), 6);
    result = Number(value).toFixed(decimalPlaces);
  }

  return result;
}
