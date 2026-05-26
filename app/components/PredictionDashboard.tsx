'use client';

import ModelMetrics from './ModelMetrics';
import ChartComponent from './ChartComponent';
import AnalyticsTabs from './AnalyticsTabs';
import TrainingComparison from './TrainingComparison';
import ModelComparison from './ModelComparison';
import { modelResults } from '@/lib/mockData';

export default function PredictionDashboard() {
  const bestModel = Object.keys(modelResults).reduce((best, current) =>
    modelResults[current] > modelResults[best] ? current : best
  );
  const bestAcc = (modelResults[bestModel] * 100).toFixed(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF7F5' }}>
      {/* Header */}
      <div
        className="text-center py-12 px-5 mx-8 mt-8 rounded-3xl border border-opacity-20 border-white shadow-md transition-shadow duration-300 hover:shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #A67A82 0%, #8B6B73 100%)',
        }}
      >
        <h1 className="text-5xl font-light text-white mb-3 tracking-tight">
          Deep Learning Analysis
        </h1>
        <p className="text-white/80 text-base font-light">
          Comprehensive Model & Training Evaluation
        </p>
      </div>

      {/* Top Metrics */}
      <div className="mx-8 grid grid-cols-4 gap-4 mb-8 mt-8">
        <ModelMetrics label="🏆 Best Model" value={bestModel} />
        <ModelMetrics label="📈 Max Accuracy" value={`${bestAcc}%`} />
        <ModelMetrics
          label="🔢 Total Models"
          value={Object.keys(modelResults).length.toString()}
        />
        <ModelMetrics
          label="📊 Avg Accuracy"
          value={`${(
            Object.values(modelResults).reduce((a, b) => a + b, 0) /
            Object.keys(modelResults).length *
            100
          ).toFixed(1)}%`}
        />
      </div>

      {/* Overall Performance Chart */}
      <div
        className="mx-8 mb-8 p-8 rounded-3xl border border-opacity-30 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <h3 className="text-lg font-light mb-8 text-gray-700 tracking-wide">
          📊 Model Performance Comparison
        </h3>
        <ChartComponent results={modelResults} />
      </div>

      {/* Training Curves Comparison */}
      <div
        className="mx-8 mb-8 p-8 rounded-3xl border border-opacity-30 shadow-sm"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <h3 className="text-lg font-light mb-6 text-gray-700 tracking-wide">
          📉 Training Curves Analysis
        </h3>
        <TrainingComparison />
      </div>

      {/* Model-wise Comparison */}
      <div
        className="mx-8 mb-8 p-8 rounded-3xl border border-opacity-30 shadow-sm"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <h3 className="text-lg font-light mb-6 text-gray-700 tracking-wide">
          🔍 Detailed Model Analysis
        </h3>
        <ModelComparison />
      </div>

      {/* Detailed Analytics Tabs */}
      <div
        className="mx-8 mb-12 p-8 rounded-3xl border border-opacity-30 shadow-sm"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <h3 className="text-lg font-light mb-6 text-gray-700 tracking-wide">
          📚 Advanced Analytics
        </h3>
        <AnalyticsTabs />
      </div>
    </div>
  );
}
