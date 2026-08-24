'use client';

import { classAccuracy, modelResults } from '@/lib/mockData';

export default function ClassAccuracyOverall() {
  const classes = ['daisy', 'dandelion', 'rose', 'sunflower', 'tulip'];
  const models = Object.keys(modelResults).sort(
    (a, b) => modelResults[b] - modelResults[a]
  );

  // Calculate average accuracy per class across all models
  const classAverages = classes.map((className) => {
    const accuracies = models
      .map((model) => classAccuracy[model]?.[className] || 0)
      .filter((acc) => acc > 0);
    return {
      className,
      average: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
      max: Math.max(...accuracies),
      min: Math.min(...accuracies),
    };
  });

  return (
    <div className="space-y-6">
      {/* Overall Class Performance */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          backgroundColor: '#F8F6F4',
          borderColor: '#D4C5C1',
        }}
      >
        <h4 className="text-sm font-light text-gray-700 mb-6">
          Average Per-Class Accuracy
        </h4>
        <div className="space-y-4">
          {classAverages
            .sort((a, b) => b.average - a.average)
            .map(({ className, average, max, min }) => (
              <div key={className}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-light text-gray-700 capitalize">
                    {className}
                  </span>
                  <div className="text-xs font-light text-gray-600 space-x-2">
                    <span>Avg: {(average * 100).toFixed(1)}%</span>
                    <span>Max: {(max * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#EBE5E0' }}
                >
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${average * 100}%`,
                      background: 'linear-gradient(90deg, #A67A82 0%, #D4B8BF 100%)',
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Per-Model Class Performance Heatmap */}
      <div
        className="p-6 rounded-2xl border overflow-x-auto"
        style={{
          backgroundColor: '#F8F6F4',
          borderColor: '#D4C5C1',
        }}
      >
        <h4 className="text-sm font-light text-gray-700 mb-6">
          Class Accuracy Heatmap (by Model)
        </h4>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 font-light text-gray-600">Model</th>
              {classes.map((cls) => (
                <th
                  key={cls}
                  className="text-center py-2 px-2 font-light text-gray-600"
                >
                  {cls.substring(0, 3)}
                </th>
              ))}
              <th className="text-center py-2 px-2 font-light text-gray-600">
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {models.slice(0, 8).map((model) => {
              const modelClassAccuracy = classAccuracy[model] || {};
              const avgAcc =
                Object.values(modelClassAccuracy).reduce((a, b) => a + b, 0) /
                Object.keys(modelClassAccuracy).length;

              return (
                <tr key={model} className="border-t" style={{ borderColor: '#D4C5C1' }}>
                  <td className="py-2 px-2 font-light text-gray-700 text-xs">
                    {model}
                  </td>
                  {classes.map((cls) => {
                    const acc = modelClassAccuracy[cls] || 0;
                    const intensity = Math.round((acc / 1) * 255);

                    return (
                      <td
                        key={cls}
                        className="text-center py-2 px-2 text-xs font-light rounded"
                        style={{
                          backgroundColor: `rgba(166, 122, 130, ${acc / 2})`,
                          color: acc > 0.7 ? '#fff' : '#666',
                        }}
                      >
                        {(acc * 100).toFixed(0)}
                      </td>
                    );
                  })}
                  <td
                    className="text-center py-2 px-2 font-light text-gray-900 rounded"
                    style={{
                      backgroundColor: `rgba(166, 122, 130, 0.2)`,
                    }}
                  >
                    {(avgAcc * 100).toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Class Difficulty Analysis */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          backgroundColor: '#F8F6F4',
          borderColor: '#D4C5C1',
        }}
      >
        <h4 className="text-sm font-light text-gray-700 mb-6">
          Class Difficulty Analysis
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div
            className="p-4 rounded-lg border text-center"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#D4C5C1',
            }}
          >
            <p className="text-xs font-light text-gray-500 uppercase mb-2">
              Easiest Class
            </p>
            <p className="text-2xl font-light text-gray-900 capitalize mb-1">
              {classAverages.reduce((max, c) =>
                c.average > max.average ? c : max
              ).className}
            </p>
            <p className="text-sm font-light text-gray-600">
              {(
                classAverages.reduce((max, c) =>
                  c.average > max.average ? c : max
                ).average * 100
              ).toFixed(1)}%
            </p>
          </div>

          <div
            className="p-4 rounded-lg border text-center"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#D4C5C1',
            }}
          >
            <p className="text-xs font-light text-gray-500 uppercase mb-2">
              Hardest Class
            </p>
            <p className="text-2xl font-light text-gray-900 capitalize mb-1">
              {classAverages.reduce((min, c) =>
                c.average < min.average ? c : min
              ).className}
            </p>
            <p className="text-sm font-light text-gray-600">
              {(
                classAverages.reduce((min, c) =>
                  c.average < min.average ? c : min
                ).average * 100
              ).toFixed(1)}%
            </p>
          </div>

          <div
            className="p-4 rounded-lg border text-center"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#D4C5C1',
            }}
          >
            <p className="text-xs font-light text-gray-500 uppercase mb-2">
              Avg Across All
            </p>
            <p className="text-2xl font-light text-gray-900 mb-1">
              {(
                classAverages.reduce((sum, c) => sum + c.average, 0) /
                classAverages.length *
                100
              ).toFixed(1)}%
            </p>
            <p className="text-sm font-light text-gray-600">
              {classAverages.length} classes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
