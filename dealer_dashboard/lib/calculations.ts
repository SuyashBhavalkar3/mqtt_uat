import { TSMData, DashboardSummary, PerformanceInsightsData } from '../types/dashboard';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(pct: number): string {
  return `${pct.toFixed(2)}%`;
}

export function calculateSummary(data: TSMData[]): DashboardSummary {
  if (data.length === 0) {
    return {
      totalTsmCount: 0,
      totalOrderAmount: 0,
      totalOrders: 0,
      totalReceivedAmount: 0,
      overallCollectionEfficiency: 0,
    };
  }

  const totalTsmCount = data.length;
  let totalOrderAmount = 0;
  let totalOrders = 0;
  let totalReceivedAmount = 0;

  for (const item of data) {
    totalOrderAmount += item.orderAmount;
    totalOrders += item.orders;
    totalReceivedAmount += item.receivedAmount;
  }

  const overallCollectionEfficiency = totalOrderAmount > 0 
    ? (totalReceivedAmount / totalOrderAmount) * 100 
    : 0;

  return {
    totalTsmCount,
    totalOrderAmount,
    totalOrders,
    totalReceivedAmount,
    overallCollectionEfficiency,
  };
}

export function calculateInsights(data: TSMData[]): PerformanceInsightsData {
  if (data.length === 0) {
    return {
      highestOrderTsm: null,
      highestOrdersTsm: null,
      highestReceivedTsm: null,
      bestCollectionTsm: null,
      overallCollectionEfficiency: 0,
    };
  }

  let highestOrderTsm: TSMData | null = null;
  let highestOrdersTsm: TSMData | null = null;
  let highestReceivedTsm: TSMData | null = null;

  for (const item of data) {
    if (item.orderAmount > 0 && (!highestOrderTsm || item.orderAmount > highestOrderTsm.orderAmount)) {
      highestOrderTsm = item;
    }
    if (item.orders > 0 && (!highestOrdersTsm || item.orders > highestOrdersTsm.orders)) {
      highestOrdersTsm = item;
    }
    if (item.receivedAmount > 0 && (!highestReceivedTsm || item.receivedAmount > highestReceivedTsm.receivedAmount)) {
      highestReceivedTsm = item;
    }
  }

  const activeTsms = data.filter(item => item.orderAmount > 0);
  let bestCollectionTsm: TSMData | null = null;

  if (activeTsms.length > 0) {
    bestCollectionTsm = activeTsms[0];
    for (const item of activeTsms) {
      if (item.collectionEfficiency > bestCollectionTsm.collectionEfficiency) {
        bestCollectionTsm = item;
      } else if (item.collectionEfficiency === bestCollectionTsm.collectionEfficiency) {
        if (item.receivedAmount > bestCollectionTsm.receivedAmount) {
          bestCollectionTsm = item;
        }
      }
    }
  }

  const summary = calculateSummary(data);

  return {
    highestOrderTsm,
    highestOrdersTsm,
    highestReceivedTsm,
    bestCollectionTsm,
    overallCollectionEfficiency: summary.overallCollectionEfficiency,
  };
}
