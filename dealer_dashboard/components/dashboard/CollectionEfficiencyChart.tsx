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

interface CollectionEfficiencyChartProps {
  data: TSMData[];
}

export function CollectionEfficiencyChart({ data }: CollectionEfficiencyChartProps) {
  // Sort descending by efficiency
  const sortedData = [...data].sort((a, b) => b.collectionEfficiency - a.collectionEfficiency);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as TSMData;
      return (
        <div className="bg-white p-3 border border-zinc-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-zinc-900">{item.tsm}</p>
          <p className="text-emerald-600 font-medium mt-1">
            Collection Efficiency: <span className="font-mono font-bold">{item.collectionEfficiency.toFixed(2)}%</span>
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Received amount relative to total order amount
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (width < 35) return null; // Don't render if bar is too small

    return (
      <text
        x={x + width - 8}
        y={y + 15}
        fill="#ffffff"
        textAnchor="end"
        fontSize={11}
        fontWeight="bold"
        className="font-mono"
      >
        {`${value.toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900">
          Collection Efficiency by TSM
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Percent of order amount collected successfully (sorted highest to lowest)
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{
              top: 5,
              right: 35,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
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
              dataKey="collectionEfficiency"
              fill="#60a5fa"
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
              label={renderCustomizedLabel}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
