export interface TSMData {
  tsm: string;
  orderAmount: number;
  orders: number;
  receivedAmount: number;
  collectionEfficiency: number;
  gap: number;
  imageUrl?: string;
}

export interface DashboardSummary {
  totalTsmCount: number;
  totalOrderAmount: number;
  totalOrders: number;
  totalReceivedAmount: number;
  overallCollectionEfficiency: number;
}

export interface PerformanceInsightsData {
  highestOrderTsm: TSMData | null;
  highestOrdersTsm: TSMData | null;
  highestReceivedTsm: TSMData | null;
  bestCollectionTsm: TSMData | null;
  overallCollectionEfficiency: number;
}

export type FetchStatus = 'loading' | 'success' | 'error' | 'syncing';
