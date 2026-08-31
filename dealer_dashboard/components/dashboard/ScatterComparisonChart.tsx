'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { TSMData } from '../../types/dashboard';
import { formatCurrency } from '../../lib/calculations';

interface ScatterComparisonChartProps {
  data: TSMData[];
}

export function ScatterComparisonChart({ data }: ScatterComparisonChartProps) {
  const formatAmount = (value: number) => {
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
            <p className="text-zinc-600 flex justify-between gap-6">
              <span className="font-medium">Order Amount:</span>
              <span className="font-mono font-bold text-zinc-900">{formatCurrency(item.orderAmount)}</span>
            </p>
            <p className="text-zinc-600 flex justify-between gap-6">
              <span className="font-medium">Received Amount:</span>
              <span className="font-mono font-bold text-zinc-900">{formatCurrency(item.receivedAmount)}</span>
            </p>
            <p className="text-indigo-600 flex justify-between gap-6 pt-1 border-t border-zinc-100 font-semibold">
              <span>Collection Efficiency:</span>
              <span className="font-mono">{item.collectionEfficiency.toFixed(2)}%</span>
            </p>
            <p className="text-amber-600 flex justify-between gap-6 font-semibold">
              <span>Collection Gap:</span>
              <span className="font-mono">{formatCurrency(item.gap)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find max values to set domain nicely
  const maxOrder = Math.max(...data.map(d => d.orderAmount), 100);
  const maxReceived = Math.max(...data.map(d => d.receivedAmount), 100);
  const chartMax = Math.ceil(Math.max(maxOrder, maxReceived) * 1.1);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900">
          Order Amount vs Received Amount Correlation
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Plotting each TSM to visualize collection performance against order volume
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis
              type="number"
              dataKey="orderAmount"
              name="Order Amount"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatAmount}
              label={{ value: 'Order Amount', position: 'bottom', offset: 0, fontSize: 12, fill: '#71717a' }}
              domain={[0, chartMax]}
            />
            <YAxis
              type="number"
              dataKey="receivedAmount"
              name="Received Amount"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatAmount}
              label={{ value: 'Received Amount', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#71717a' }}
              domain={[0, chartMax]}
            />
            <ZAxis range={[100, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="TSMs" data={data} fill="#1e3a8a" line={false} shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
