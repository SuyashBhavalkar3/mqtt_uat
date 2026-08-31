'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TSMData, FetchStatus } from '../types/dashboard';
import { fetchDashboardData } from '../lib/sheetApi';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KPICards } from '../components/dashboard/KPICards';
import { OrderAmountChart } from '../components/dashboard/OrderAmountChart';
import { OrdersChart } from '../components/dashboard/OrdersChart';
import { CollectionEfficiencyChart } from '../components/dashboard/CollectionEfficiencyChart';
import { ScatterComparisonChart } from '../components/dashboard/ScatterComparisonChart';
import { PerformanceTable } from '../components/dashboard/PerformanceTable';
import { PerformanceInsights } from '../components/dashboard/PerformanceInsights';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<TSMData[]>([]);
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [pollingInterval, setPollingInterval] = useState<number>(2500); // default to 2.5s
  
  // Use ref to hold polling interval ID
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async (isPolling = false) => {
    if (!isPolling) {
      setStatus(prev => prev === 'success' ? 'syncing' : 'loading');
    }

    try {
      const { data: fetched, pingTime } = await fetchDashboardData();
      setData(fetched);
      setStatus('success');
      setLastUpdated(new Date());
      if (pingTime > 0) {
        setPollingInterval(pingTime * 1000);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Keep previous data but signal connection issue
      setStatus('error');
    }
  }, []);

  // Poll configuration effect
  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      loadData(true);
    }, pollingInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [pollingInterval, loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualRefresh = () => {
    loadData();
    // Restart polling interval to reset the timer
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    pollingIntervalRef.current = setInterval(() => {
      loadData(true);
    }, pollingInterval);
  };

  const isInitialLoading = status === 'loading' && data.length === 0;

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <DashboardHeader
          status={status}
          lastUpdated={lastUpdated}
          onRefresh={handleManualRefresh}
        />

        {status === 'error' && data.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center max-w-lg mx-auto">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-zinc-900">Failed to Connect</h3>
            <p className="text-sm text-zinc-600 mt-2">
              We couldn&apos;t retrieve the dealer meet sheet data. Please check your internet connection. Retrying automatically...
            </p>
            <button
              onClick={handleManualRefresh}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition"
            >
              Retry Now
            </button>
          </div>
        )}

        {/* Skeleton loaders for initial load */}
        {isInitialLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6 h-28"></div>
              ))}
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 h-96"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 rounded-xl p-6 h-80"></div>
              <div className="bg-white border border-zinc-200 rounded-xl p-6 h-80"></div>
            </div>
          </div>
        ) : (
          data.length > 0 && (
            <div className="space-y-8">
              
              {/* KPI Cards */}
              <KPICards data={data} isLoading={status === 'loading'} />

              {/* Main Comparison Chart */}
              <OrderAmountChart data={data} />

              {/* Grid with side-by-side charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OrdersChart data={data} />
                <CollectionEfficiencyChart data={data} />
              </div>

              {/* Scatter Chart for Gap Visualization */}
              <ScatterComparisonChart data={data} />

              {/* Performance Table */}
              <PerformanceTable data={data} />

              {/* Performance Insights */}
              <PerformanceInsights data={data} />

            </div>
          )
        )}
      </div>
    </div>
  );
}
