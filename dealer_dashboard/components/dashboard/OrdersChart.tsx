'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TSMData } from '../../types/dashboard';

interface OrdersChartProps {
  data: TSMData[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  // Sort descending by orders
  const sortedData = [...data].sort((a, b) => b.orders - a.orders);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as TSMData;
      return (
        <div className="bg-white p-3 border border-zinc-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-zinc-900">{item.tsm}</p>
          <p className="text-amber-600 font-medium mt-1">
            Orders: <span className="font-mono font-bold">{item.orders}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900">
          Orders by TSM
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Ranking of territories by total volume of transactions
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{
              top: 5,
              right: 25,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
            <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="tsm"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={70}
              tick={{ fontWeight: '600', fill: '#18181b' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5', opacity: 0.5 }} />
            <Bar
              dataKey="orders"
              fill="#93c5fd"
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
