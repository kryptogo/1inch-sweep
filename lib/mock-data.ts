import { MOCK_DORMANT_ASSETS, SERVICE_FEE_PERCENTAGE, MINIMUM_FEE_USD } from './constants';

export function getSelectedAssetsTotal(selectedAssetIds: number[]) {
  return MOCK_DORMANT_ASSETS
    .filter(asset => selectedAssetIds.includes(asset.id))
    .reduce((total, asset) => total + asset.value, 0);
}

export function calculateServiceFee(totalValue: number) {
  const percentageFee = totalValue * (SERVICE_FEE_PERCENTAGE / 100);
  return Math.max(percentageFee, MINIMUM_FEE_USD);
}

export function calculateFinalAmount(totalValue: number) {
  const fee = calculateServiceFee(totalValue);
  return totalValue - fee;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function simulateScanningDelay() {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000); // 5 seconds delay
  });
}