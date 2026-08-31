'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { TSMData } from '../../types/dashboard';
import { formatCurrency, formatPercentage } from '../../lib/calculations';

interface PerformanceTableProps {
  data: TSMData[];
}

type SortField = 'tsm' | 'orderAmount' | 'orders' | 'receivedAmount' | 'collectionEfficiency' | 'gap';
type SortOrder = 'asc' | 'desc';

export function PerformanceTable({ data }: PerformanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('orderAmount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Find the overall best-performing TSM based on efficiency (and minimal orders to be fair)
  const bestTsmName = useMemo(() => {
    const activeTsms = data.filter(d => d.orderAmount > 0);
    if (activeTsms.length === 0) return '';
    return activeTsms.reduce((best, current) =>
      current.orderAmount > best.orderAmount ? current : best
    ).tsm;
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for numbers
    }
  };

  const filteredAndSortedData = useMemo(() => {
    return data
      .filter((item) =>
        item.tsm.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        // Numbers
        valA = valA as number;
        valB = valB as number;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [data, searchTerm, sortField, sortOrder]);

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-zinc-950 font-semibold transition-colors duration-150 py-2 focus:outline-none"
      >
        <span>{label}</span>
        {isActive && (
          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </button>
    );
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-950">
            TSM Performance Standings
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Detailed view of targets, collections, efficiency, and gaps
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search TSM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 placeholder-zinc-400 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[480px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/75 text-zinc-600 text-xs tracking-wider uppercase sticky top-0 backdrop-blur-sm z-10">
              <th className="px-6 py-3 font-semibold text-zinc-700">
                <SortHeader field="tsm" label="TSM" />
              </th>
              <th className="px-6 py-3 font-semibold text-zinc-700 text-right">
                <div className="flex justify-end">
                  <SortHeader field="orderAmount" label="Order Amount" />
                </div>
              </th>
              <th className="px-6 py-3 font-semibold text-zinc-700 text-right">
                <div className="flex justify-end">
                  <SortHeader field="orders" label="Orders" />
                </div>
              </th>
              <th className="px-6 py-3 font-semibold text-zinc-700 text-right">
                <div className="flex justify-end">
                  <SortHeader field="receivedAmount" label="Received Amount" />
                </div>
              </th>
              <th className="px-6 py-3 font-semibold text-zinc-700 text-right">
                <div className="flex justify-end">
                  <SortHeader field="collectionEfficiency" label="Collection %" />
                </div>
              </th>
              <th className="px-6 py-3 font-semibold text-zinc-700 text-right">
                <div className="flex justify-end">
                  <SortHeader field="gap" label="Gap" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((row) => {
                const isBest = row.tsm === bestTsmName;
                return (
                  <tr
                    key={row.tsm}
                    className={`hover:bg-zinc-50 transition-colors duration-150 ${isBest ? 'bg-emerald-50/30' : ''
                      }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                      {row.tsm}
                      {isBest && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Star className="h-3 w-3 fill-blue-600 text-blue-600" />
                          <span>Top Performer</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-zinc-950 text-right">
                      {formatCurrency(row.orderAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-zinc-950 text-right">
                      {row.orders.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-zinc-950 text-right">
                      {formatCurrency(row.receivedAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${row.collectionEfficiency >= 90
                          ? 'bg-blue-100 text-blue-800 border border-blue-200/50'
                          : row.collectionEfficiency >= 75
                            ? 'bg-blue-50 text-blue-600 border border-blue-100/30'
                            : row.collectionEfficiency >= 50
                              ? 'bg-zinc-100 text-zinc-600'
                              : 'bg-zinc-50 text-zinc-400'
                          }`}
                      >
                        {formatPercentage(row.collectionEfficiency)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-semibold">
                      <span className={row.gap > 0 ? 'text-zinc-800 font-bold' : 'text-zinc-500'}>
                        {formatCurrency(row.gap)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500 font-medium">
                  No TSM match found for &quot;{searchTerm}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
