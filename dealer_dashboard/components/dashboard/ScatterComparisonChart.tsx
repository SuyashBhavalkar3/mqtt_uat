'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TSMData } from '../../types/dashboard';
import { formatCurrency } from '../../lib/calculations';

interface ScatterComparisonChartProps {
  data: TSMData[];
}

export function ScatterComparisonChart({ data }: ScatterComparisonChartProps) {
  const formatAmount = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')}L`;
    }
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as TSMData;
      return (
        <div className="bg-white p-4 border border-zinc-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 mb-2">{item.tsm}</p>
          <div className="space-y-1">
            <p className="text-blue-600 flex justify-between gap-6">
              <span className="font-medium">Order Amount:</span>
              <span className="font-mono font-bold">{formatCurrency(item.orderAmount)}</span>
            </p>
            <p className="text-emerald-600 flex justify-between gap-6">
              <span className="font-medium">Received Amount:</span>
              <span className="font-mono font-bold">{formatCurrency(item.receivedAmount)}</span>
            </p>
            <p className="text-zinc-600 flex justify-between gap-6 pt-1 border-t border-zinc-100">
              <span className="font-medium">Collection Gap:</span>
              <span className="font-mono font-semibold text-zinc-900">{formatCurrency(item.gap)}</span>
            </p>
            <p className="text-zinc-500 flex justify-between gap-6 text-xs">
              <span className="font-medium">Collection %:</span>
              <span className="font-mono font-semibold">{item.collectionEfficiency.toFixed(2)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900">
          Order Amount vs Received Amount Comparison
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Comparing order booking against payment collections for each TSM
        </p>
      </div>

      {/* Legend rendered as standard HTML */}
      <div className="flex justify-center gap-6 text-[12px] font-semibold text-zinc-600 pb-2 border-b border-zinc-100 mb-6">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#2563eb] inline-block"></span>
          <span>Order Amount</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#059669] inline-block"></span>
          <span>Received Amount</span>
        </span>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              bottom: 10,
              left: -10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="tsm"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              tick={{ fontWeight: '600', fill: '#18181b' }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAmount}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="orderAmount"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="receivedAmount"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
