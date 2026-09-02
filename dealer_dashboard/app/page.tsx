'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TSMData, FetchStatus } from '../types/dashboard';
import { fetchDashboardData } from '../lib/sheetApi';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DateRangeSelector } from '../components/dashboard/DateRangeSelector';
import { KPICards } from '../components/dashboard/KPICards';
import { OrderAmountChart } from '../components/dashboard/OrderAmountChart';
import { OrdersChart } from '../components/dashboard/OrdersChart';
import { CollectionEfficiencyChart } from '../components/dashboard/CollectionEfficiencyChart';
import { ScatterComparisonChart } from '../components/dashboard/ScatterComparisonChart';
import { PerformanceTable } from '../components/dashboard/PerformanceTable';
import { PerformanceInsights } from '../components/dashboard/PerformanceInsights';
import { AlertCircle } from 'lucide-react';

function getTodayDateStr(): string {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
}

function getPrevDayDateStr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
}

export default function Home() {
  const [data, setData] = useState<TSMData[]>([]);
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Date range states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDateInitialized, setIsDateInitialized] = useState<boolean>(false);

  const [pollingInterval, setPollingInterval] = useState<number>(2500); // default to 2.5s
  
  // Use ref to hold polling interval ID and current dates for interval closure
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dateRangeRef = useRef<{ start: string; end: string }>({ start: '', end: '' });

  // Initialize dates from URL or localStorage or default to Today
  useEffect(() => {
    const today = getTodayDateStr();
    let initialStart = today;
    let initialEnd = today;

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStart = urlParams.get('start_date') || urlParams.get('from_date');
      const urlEnd = urlParams.get('end_date') || urlParams.get('to_date');
      
      const storedStart = localStorage.getItem('dealer_meet_start_date');
      const storedEnd = localStorage.getItem('dealer_meet_end_date');

      if (urlStart && urlEnd) {
        initialStart = urlStart;
        initialEnd = urlEnd;
      } else if (storedStart && storedEnd) {
        initialStart = storedStart;
        initialEnd = storedEnd;
      }
    }

    // Enforce validation: end cannot exceed today, start cannot exceed end
    if (initialEnd > today) {
      initialEnd = today;
    }
    if (initialStart > initialEnd) {
      initialStart = initialEnd;
    }

    setStartDate(initialStart);
    setEndDate(initialEnd);
    dateRangeRef.current = { start: initialStart, end: initialEnd };
    setIsDateInitialized(true);
  }, []);

  const loadData = useCallback(async (isPolling = false, customStart?: string, customEnd?: string) => {
    const today = getTodayDateStr();
    let start = customStart || dateRangeRef.current.start || today;
    let end = customEnd || dateRangeRef.current.end || today;

    if (end > today) end = today;
    if (start > end) start = end;

    if (!isPolling) {
      setStatus(prev => prev === 'success' ? 'syncing' : 'loading');
    }

    try {
      const { data: fetched, pingTime } = await fetchDashboardData(start, end);
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

  // Handle date change from user with persistence
  const handleDateChange = (newStart: string, newEnd: string) => {
    const today = getTodayDateStr();
    let validatedStart = newStart;
    let validatedEnd = newEnd;

    // Enforce validation: cannot exceed today, start cannot exceed end (can be equal)
    if (validatedEnd > today) validatedEnd = today;
    if (validatedStart > validatedEnd) validatedStart = validatedEnd;

    setStartDate(validatedStart);
    setEndDate(validatedEnd);
    dateRangeRef.current = { start: validatedStart, end: validatedEnd };

    // Persist in localStorage so it does not reset on browser refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('dealer_meet_start_date', validatedStart);
      localStorage.setItem('dealer_meet_end_date', validatedEnd);

      // Also update URL query params without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('start_date', validatedStart);
      url.searchParams.set('end_date', validatedEnd);
      window.history.replaceState({}, '', url.toString());
    }

    // Trigger immediate reload
    loadData(false, validatedStart, validatedEnd);
  };

  const handleResetDates = () => {
    const today = getTodayDateStr();
    handleDateChange(today, today);
  };

  // Initial load when dates are initialized
  useEffect(() => {
    if (isDateInitialized) {
      loadData(false, startDate, endDate);
    }
  }, [isDateInitialized, loadData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll configuration effect
  useEffect(() => {
    if (!isDateInitialized) return;

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
  }, [pollingInterval, loadData, isDateInitialized]);

  const handleManualRefresh = () => {
    loadData(false, startDate, endDate);
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

        {/* Date Range Selection Filter Bar */}
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          onReset={handleResetDates}
          isLoading={status === 'loading' || status === 'syncing'}
        />

        {status === 'error' && data.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center max-w-lg mx-auto">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-zinc-900">Failed to Connect</h3>
            <p className="text-sm text-zinc-600 mt-2">
              We couldn&apos;t retrieve the dealer meet sheet data for the selected date range ({startDate} to {endDate}). Please check your connection.
            </p>
            <button
              onClick={handleManualRefresh}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition cursor-pointer"
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

              {/* KPI Cards (Footer status overview) */}
              <KPICards data={data} isLoading={status === 'loading'} />

            </div>
          )
        )}
      </div>
    </div>
  );
}
