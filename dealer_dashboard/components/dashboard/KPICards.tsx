'use client';

import React from 'react';
import { Users, ShoppingBag, IndianRupee, CreditCard } from 'lucide-react';
import { TSMData } from '../../types/dashboard';
import { calculateSummary, formatCurrency } from '../../lib/calculations';

interface KPICardsProps {
  data: TSMData[];
  isLoading: boolean;
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  const summary = calculateSummary(data);

  const cards = [
    {
      title: 'Total TSMs',
      value: summary.totalTsmCount.toString(),
      subtext: 'Active territories',
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-100/40',
    },
    {
      title: 'Total Orders',
      value: summary.totalOrders.toLocaleString(),
      subtext: 'Completed transactions',
      icon: ShoppingBag,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-100/40',
    },
    {
      title: 'Total Order Amount',
      value: formatCurrency(summary.totalOrderAmount),
      subtext: 'Across all TSMs',
      icon: IndianRupee,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-100/40',
    },
    {
      title: 'Total Received Amount',
      value: formatCurrency(summary.totalReceivedAmount),
      subtext: `Efficiency: ${summary.overallCollectionEfficiency.toFixed(2)}%`,
      icon: CreditCard,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-100/40',
    },
  ];

  if (isLoading && data.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-white border border-zinc-200 rounded-xl p-6 h-28">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 bg-zinc-200 rounded w-24"></div>
              <div className="h-8 bg-zinc-200 rounded-full w-8"></div>
            </div>
            <div className="h-6 bg-zinc-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-zinc-150 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-zinc-200 hover:border-zinc-300 transition-all duration-200 rounded-xl p-6 shadow-sm flex items-center gap-5"
          >
            <div className={`${card.bgColor} ${card.iconColor} p-3 rounded-xl border ${card.borderColor} flex-shrink-0 flex items-center justify-center`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">
                {card.title}
              </span>
              <h3 className="text-2xl font-bold text-zinc-950 font-sans tracking-tight">
                {card.value}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1 font-medium">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
