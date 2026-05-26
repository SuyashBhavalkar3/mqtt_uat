'use client';

import { modelResults, modelSpecs, classAccuracy } from '@/lib/mockData';

export default function ModelComparison() {
  const models = Object.keys(modelResults).sort(
    (a, b) => modelResults[b] - modelResults[a]
  );

  return (
    <div className="space-y-6">
      {/* Performance Ranking Table */}
      <div
        className="p-6 rounded-2xl border overflow-x-auto"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <h4 className="text-sm font-light text-gray-700 mb-4">Model Performance Ranking</h4>
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: '#D4C5C1' }}
            >
              <th className="text-left py-3 px-3 font-light text-gray-600">Rank</th>
              <th className="text-left py-3 px-3 font-light text-gray-600">Model</th>
              <th className="text-left py-3 px-3 font-light text-gray-600">Accuracy</th>
              <th className="text-left py-3 px-3 font-light text-gray-600">Type</th>
              <th className="text-left py-3 px-3 font-light text-gray-600">Parameters</th>
              <th className="text-left py-3 px-3 font-light text-gray-600">Optimizer</th>
            </tr>
          </thead>
          <tbody>
            {models.map((modelName, idx) => {
              const specs = modelSpecs[modelName];
              const [architecture, optimizer] = modelName.split('_');

              return (
                <tr
                  key={modelName}
                  className="border-b hover:bg-opacity-50 transition-all"
                  style={{
                    borderColor: '#D4C5C1',
                    backgroundColor: idx === 0 ? '#F0E8E5' : 'transparent',
                  }}
                >
                  <td className="py-3 px-3 font-light text-gray-900">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </td>
                  <td className="py-3 px-3 font-light text-gray-900">{modelName}</td>
                  <td className="py-3 px-3 font-light text-gray-900">
                    {(modelResults[modelName] * 100).toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 font-light text-gray-700 text-xs">
                    {architecture}
                  </td>
                  <td className="py-3 px-3 font-light text-gray-700">
                    {specs.parameters}
                  </td>
                  <td className="py-3 px-3 font-light text-gray-700">
                    {optimizer}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Architecture Breakdown */}
      <div className="grid grid-cols-4 gap-4">
        {['ANN', 'CNN', 'Freeze', 'Unfreeze'].map((arch) => {
          const archModels = models.filter((m) => m.startsWith(arch));
          const avgAccuracy =
            archModels.reduce((sum, m) => sum + modelResults[m], 0) /
            archModels.length;

          return (
            <div
              key={arch}
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: '#F8F6F4',
                borderColor: '#D4C5C1',
              }}
            >
              <p className="text-xs font-light text-gray-500 uppercase mb-2">
                {arch}
              </p>
              <p className="text-2xl font-light text-gray-900 mb-3">
                {(avgAccuracy * 100).toFixed(1)}%
              </p>
              <div className="text-xs font-light text-gray-600 space-y-1">
                {archModels.map((m) => (
                  <div key={m} className="flex justify-between">
                    <span>{m.split('_')[1]}</span>
                    <span className="text-gray-900">
                      {(modelResults[m] * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Optimizer Impact Analysis */}
      <div className="grid grid-cols-2 gap-4">
        {['Adam', 'SGD'].map((opt) => {
          const optModels = models.filter((m) => m.endsWith(opt));
          const avgAccuracy =
            optModels.reduce((sum, m) => sum + modelResults[m], 0) /
            optModels.length;
          const improvement =
            avgAccuracy -
            models
              .filter((m) => m.endsWith(opt === 'Adam' ? 'SGD' : 'Adam'))
              .reduce((sum, m) => sum + modelResults[m], 0) /
            models.filter((m) => m.endsWith(opt === 'Adam' ? 'SGD' : 'Adam'))
              .length;

          return (
            <div
              key={opt}
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: '#F8F6F4',
                borderColor: '#D4C5C1',
              }}
            >
              <p className="text-sm font-light text-gray-700 mb-4">{opt} Optimizer</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-light text-gray-600 mb-2">Average Accuracy</p>
                  <p className="text-3xl font-light text-gray-900">
                    {(avgAccuracy * 100).toFixed(1)}%
                  </p>
                </div>
                {improvement > 0 && (
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: '#E8F5E9' }}
                  >
                    <p className="text-xs font-light text-green-700">
                      +{(improvement * 100).toFixed(2)}% vs {opt === 'Adam' ? 'SGD' : 'Adam'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Distribution */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          backgroundColor: '#F8F6F4',
          borderColor: '#D4C5C1',
        }}
      >
        <h4 className="text-sm font-light text-gray-700 mb-6">Accuracy Distribution</h4>
        <div className="space-y-3">
          {models.map((modelName) => (
            <div key={modelName}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-light text-gray-700">{modelName}</span>
                <span className="text-xs font-light text-gray-900">
                  {(modelResults[modelName] * 100).toFixed(2)}%
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: '#EBE5E0' }}
              >
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${modelResults[modelName] * 100}%`,
                    background: 'linear-gradient(90deg, #A67A82 0%, #D4B8BF 100%)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
