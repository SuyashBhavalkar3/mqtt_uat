'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { TSMData } from '../../types/dashboard';
import { formatCurrency } from '../../lib/calculations';

interface OrderAmountChartProps {
  data: TSMData[];
}

export function OrderAmountChart({ data }: OrderAmountChartProps) {
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => a.tsm.localeCompare(b.tsm));
  }, [data]);

  const formatYAxis = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`;
    }
    return `₹${value}`;
  };

  const renderCustomLabel = (props: any) => {
    const { x, width, index } = props;
    const item = sortedData[index];
    if (!item || !item.imageUrl) return null;

    // Fixed Y coordinate at the top of the grid to align all photos in a straight line below the HTML legend
    const fixedY = 45;
    const radius = 40; // Huge diameter (80px) to fill and center in row height

    return (
      <g>
        <defs>
          <clipPath id={`clip-${index}`}>
            <circle cx={x + width / 2} cy={fixedY} r={radius} />
          </clipPath>
        </defs>
        <circle cx={x + width / 2} cy={fixedY} r={radius + 1} fill="#e4e4e7" stroke="#ffffff" strokeWidth="2" />
        <image
          x={x + width / 2 - radius}
          y={fixedY - radius}
          width={radius * 2}
          height={radius * 2}
          href={item.imageUrl}
          clipPath={`url(#clip-${index})`}
          preserveAspectRatio="xMidYMin slice"
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find payload items by dataKey to ensure correct mapping
      const orderAmountPayload = payload.find((p: any) => p.dataKey === 'orderAmount');
      const receivedAmountPayload = payload.find((p: any) => p.dataKey === 'receivedAmount');
      const ordersPayload = payload.find((p: any) => p.dataKey === 'orders');

      const orderAmount = orderAmountPayload ? orderAmountPayload.value : 0;
      const receivedAmount = receivedAmountPayload ? receivedAmountPayload.value : 0;
      const orders = ordersPayload ? ordersPayload.value : 0;

      return (
        <div className="bg-white p-4 border border-zinc-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-zinc-900 mb-2">{label}</p>
          <div className="space-y-1.5">
            <p className="text-[#3b82f6] flex items-center justify-between gap-6">
              <span className="font-medium">Order Amount:</span>
              <span className="font-mono font-bold">{formatCurrency(orderAmount)}</span>
            </p>
            <p className="text-[#60a5fa] flex items-center justify-between gap-6">
              <span className="font-medium">Received Amount:</span>
              <span className="font-mono font-bold">{formatCurrency(receivedAmount)}</span>
            </p>
            <p className="text-[#93c5fd] flex items-center justify-between gap-6">
              <span className="font-medium">Orders Count:</span>
              <span className="font-mono font-bold">{orders} orders</span>
            </p>
            <div className="pt-1.5 border-t border-zinc-100 flex flex-col gap-0.5">
              <p className="text-zinc-600 flex items-center justify-between gap-6">
                <span className="font-medium">Collection %:</span>
                <span className="font-mono font-bold">
                  {(((receivedAmount) / (orderAmount || 1)) * 100).toFixed(2)}%
                </span>
              </p>
              <p className="text-zinc-500 flex items-center justify-between gap-6 text-xs">
                <span className="font-medium">Collection Gap:</span>
                <span className="font-mono font-semibold">{formatCurrency(orderAmount - receivedAmount)}</span>
              </p>
            </div>
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
          Order Performance vs Order Count by TSM
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Grouped overview showing target amounts, collections, and total number of transactions
        </p>
      </div>

      {/* Legend rendered as a standard HTML container at the very top, completely outside Recharts SVG context */}
      <div className="flex justify-center gap-6 text-[12px] font-semibold text-zinc-600 pb-2 border-b border-zinc-100 mb-6">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
          <span>Order Amount</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#60a5fa' }}></span>
          <span>Received Amount</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#bfdbfe' }}></span>
          <span>Orders</span>
        </span>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{
              top: 90,
              right: 15,
              left: -10,
              bottom: 0,
            }}
            barGap={4}
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
            {/* Primary Y-Axis (Left) - Amount Scale */}
            <YAxis
              yAxisId="left"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              dx={-5}
            />
            {/* Secondary Y-Axis (Right) - Orders Scale */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
              dx={5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5', opacity: 0.5 }} />
            <Bar
              yAxisId="left"
              name="Order Amount"
              dataKey="orderAmount"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
              isAnimationActive={false}
            />
            <Bar
              yAxisId="left"
              name="Received Amount"
              dataKey="receivedAmount"
              fill="#60a5fa"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
              isAnimationActive={false}
            >
              <LabelList dataKey="imageUrl" content={renderCustomLabel} />
            </Bar>
            <Bar
              yAxisId="right"
              name="Orders"
              dataKey="orders"
              fill="#bfdbfe"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
