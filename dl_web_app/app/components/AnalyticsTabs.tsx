'use client';

import { useState } from 'react';
import OptimizerComparison from './OptimizerComparison';
import ArchitectureComparison from './ArchitectureComparison';
import ClassAccuracyOverall from './ClassAccuracyOverall';
import {
  optimizerComparison,
  architectureComparison,
} from '@/lib/mockData';

export default function AnalyticsTabs() {
  const [activeTab, setActiveTab] = useState<
    'optimizer' | 'architecture' | 'class'
  >('optimizer');

  const tabs = [
    { id: 'optimizer' as const, label: '🔧 Optimizer Analysis' },
    { id: 'architecture' as const, label: '🏗️ Architecture Analysis' },
    { id: 'class' as const, label: '🎯 Class-wise Performance' },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-opacity-20" style={{ borderColor: '#D4C5C1' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-sm font-light whitespace-nowrap transition-all duration-200 border-b-2"
            style={{
              borderColor: activeTab === tab.id ? '#A67A82' : 'transparent',
              color: activeTab === tab.id ? '#A67A82' : '#999',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'optimizer' && (
          <OptimizerComparison data={optimizerComparison} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureComparison data={architectureComparison} />
        )}

        {activeTab === 'class' && (
          <ClassAccuracyOverall />
        )}
      </div>
    </div>
  );
}
