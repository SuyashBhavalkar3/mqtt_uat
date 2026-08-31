'use client';

import React from 'react';
import { RefreshCw, Radio, WifiOff } from 'lucide-react';
import { FetchStatus } from '../../types/dashboard';

interface DashboardHeaderProps {
  status: FetchStatus;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function DashboardHeader({ status, lastUpdated, onRefresh }: DashboardHeaderProps) {
  const isError = status === 'error';
  const isLoading = status === 'loading' || status === 'syncing';

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-5 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          Dealer Meet Dashboard
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          TSM Performance Overview
        </p>
      </div>

      <div className="flex items-center gap-4 mt-4 md:mt-0 flex-wrap">
        <div className="flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-200 text-sm">
          {isError ? (
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <WifiOff className="h-4 w-4 animate-bounce" />
              <span>Connection issue</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <Radio className="h-4 w-4 animate-pulse" />
              <span>Live</span>
            </div>
          )}
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-600">
            Last updated: <span className="font-mono">{formatTime(lastUpdated)}</span>
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
