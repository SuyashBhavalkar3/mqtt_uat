'use client';

import React from 'react';
import { Award, TrendingUp, Sparkles, AlertCircle, Percent } from 'lucide-react';
import { TSMData } from '../../types/dashboard';
import { calculateInsights, formatCurrency, formatPercentage } from '../../lib/calculations';

interface PerformanceInsightsProps {
  data: TSMData[];
}

export function PerformanceInsights({ data }: PerformanceInsightsProps) {
  const insights = calculateInsights(data);

  if (data.length === 0) return null;

  const cards = [
    {
      title: 'Highest Order Bookings',
      value: insights.highestOrderTsm ? insights.highestOrderTsm.tsm : 'N/A',
      detail: insights.highestOrderTsm 
        ? `Value: ${formatCurrency(insights.highestOrderTsm.orderAmount)}`
        : '',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/70 border border-blue-100/30',
    },
    {
      title: 'Highest Volume (Orders)',
      value: insights.highestOrdersTsm ? insights.highestOrdersTsm.tsm : 'N/A',
      detail: insights.highestOrdersTsm
        ? `${insights.highestOrdersTsm.orders} total orders`
        : '',
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50/70 border border-blue-100/30',
    },
    {
      title: 'Highest Amount Collected',
      value: insights.highestReceivedTsm ? insights.highestReceivedTsm.tsm : 'N/A',
      detail: insights.highestReceivedTsm
        ? `Collected: ${formatCurrency(insights.highestReceivedTsm.receivedAmount)}`
        : '',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/70 border border-blue-100/30',
    },
    {
      title: 'Best Collection Efficiency',
      value: insights.bestCollectionTsm ? insights.bestCollectionTsm.tsm : 'N/A',
      detail: insights.bestCollectionTsm
        ? `Rate: ${formatPercentage(insights.bestCollectionTsm.collectionEfficiency)}`
        : '',
      icon: Percent,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50/70 border border-blue-100/30',
    },
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="bg-indigo-50 p-1.5 rounded-lg">
          <AlertCircle className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-950">
            Performance Insights
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Key automated takeaways generated from the live backend data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="border border-zinc-100 rounded-xl p-4 bg-zinc-50/50 flex gap-4 items-start">
              <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-zinc-500 text-xs font-semibold block uppercase tracking-wider">
                  {card.title}
                </span>
                <span className="text-base font-bold text-zinc-900 block mt-1 truncate">
                  {card.value}
                </span>
                <span className="text-zinc-500 text-xs mt-0.5 block font-medium">
                  {card.detail}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
