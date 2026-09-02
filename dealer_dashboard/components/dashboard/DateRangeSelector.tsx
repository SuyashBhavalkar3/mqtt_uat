'use client';

import React, { useState } from 'react';
import { Calendar, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

function getTodayStr(): string {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
}

function getPrevDayStr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
}

export function DateRangeSelector({
  startDate,
  endDate,
  onChange,
  onReset,
  isLoading = false,
}: DateRangeSelectorProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const today = getTodayStr();

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newStart = e.target.value;
    if (!newStart) return;

    setErrorMsg(null);

    // Rule 1: Cannot be greater than today
    if (newStart > today) {
      newStart = today;
      setErrorMsg('From date cannot be in the future.');
    }

    // Rule 2: If start is after current end, adjust end to match start (single day view)
    let newEnd = endDate;
    if (newStart > newEnd) {
      newEnd = newStart;
    }

    onChange(newStart, newEnd);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newEnd = e.target.value;
    if (!newEnd) return;

    setErrorMsg(null);

    // Rule 1: Cannot be greater than today
    if (newEnd > today) {
      newEnd = today;
      setErrorMsg('To date cannot be in the future.');
    }

    // Rule 2: If end is before current start, adjust start to match end (single day view)
    let newStart = startDate;
    if (newEnd < newStart) {
      newStart = newEnd;
    }

    onChange(newStart, newEnd);
  };

  // Quick preset helpers
  const handleSetToday = () => {
    setErrorMsg(null);
    onChange(today, today);
  };

  const handleSetYesterday = () => {
    setErrorMsg(null);
    const yesterday = getPrevDayStr(today);
    onChange(yesterday, yesterday);
  };

  const handleSetLast7Days = () => {
    setErrorMsg(null);
    const end = today;
    const endObj = new Date();
    const tzOffset = endObj.getTimezoneOffset() * 60000;
    const startObj = new Date(endObj.getTime() - (6 * 24 * 60 * 60 * 1000) - tzOffset);
    const start = startObj.toISOString().split('T')[0];
    onChange(start, end);
  };

  const handleSetMonthToDate = () => {
    setErrorMsg(null);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const start = `${year}-${month}-01`;
    const end = today;
    onChange(start, end);
  };

  const handleSetEventRange = () => {
    setErrorMsg(null);
    const start = '2026-08-28';
    const end = today;
    onChange(start, end);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-2.5 text-zinc-900 font-semibold text-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span>Filter by Date Range</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                {startDate === endDate ? `Single Day: ${startDate}` : `${startDate} to ${endDate}`}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal">
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Inputs container */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 text-sm">
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">From</span>
              <input
                type="date"
                value={startDate}
                max={endDate || today}
                onChange={handleStartChange}
                className="bg-white border border-zinc-200 rounded px-2.5 py-1 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              />
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

            <div className="flex items-center gap-1.5 px-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">To</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={today}
                onChange={handleEndChange}
                className="bg-white border border-zinc-200 rounded px-2.5 py-1 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={handleSetToday}
              className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleSetYesterday}
              className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition cursor-pointer"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={handleSetLast7Days}
              className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition cursor-pointer"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={handleSetMonthToDate}
              className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition cursor-pointer"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={handleSetEventRange}
              className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition cursor-pointer"
            >
              Event Week
            </button>
            <button
              type="button"
              onClick={onReset}
              title="Reset to Today"
              className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
