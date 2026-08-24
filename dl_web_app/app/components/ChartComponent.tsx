'use client';

interface ChartComponentProps {
  results: Record<string, number>;
}

export default function ChartComponent({ results }: ChartComponentProps) {
  const entries = Object.entries(results);
  const maxValue = Math.max(...entries.map(([, v]) => v));
  const barGradients = [
    'linear-gradient(180deg, #A67A82 0%, #D4B8BF 100%)',
    'linear-gradient(180deg, #7A9E9F 0%, #B7D4D5 100%)',
    'linear-gradient(180deg, #C48C5A 0%, #E8C6A9 100%)',
    'linear-gradient(180deg, #7EBC5C 0%, #A7D68B 100%)',
    'linear-gradient(180deg, #6D7FA8 0%, #AEB9D9 100%)',
    'linear-gradient(180deg, #B5799A 0%, #DDB6CB 100%)',
  ];

  const bestModel = entries.reduce((best, current) =>
    current[1] > best[1] ? current : best
  )[0];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 h-72">
        {entries.map(([modelName, accuracy], index) => (
          <div
            key={modelName}
            className="flex-1 flex flex-col items-center"
            style={{
              animation: `slideUpChart 0.6s ease-out ${index * 50}ms both`,
            }}
          >
            <div
              className="w-full rounded-t-lg transition-all duration-500 hover:shadow-lg hover:brightness-110"
              style={{
                height: `${(accuracy / maxValue) * 240}px`,
                background:
                  modelName === bestModel
                    ? 'linear-gradient(180deg, #7EBC5C 0%, #6BA84A 100%)'
                    : barGradients[index % barGradients.length],
                boxShadow: modelName === bestModel
                  ? '0 -8px 16px rgba(126, 188, 92, 0.25)'
                  : '0 -4px 12px rgba(166, 122, 130, 0.15)',
                cursor: 'pointer',
              }}
              title={`${modelName}: ${(accuracy * 100).toFixed(1)}%`}
            />
            <span className="text-xs font-light text-gray-700 mt-4 text-center leading-tight">
              {(accuracy * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-light text-gray-500 mt-2 text-center">
              {modelName}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideUpChart {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="pt-6 border-t border-opacity-20" style={{ borderColor: '#D4C5C1' }}>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: '#F8F6F4',
            }}
          >
            <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-2">
              Best Performing
            </p>
            <p className="text-lg font-light text-gray-900">{bestModel}</p>
            <p className="text-sm font-light text-gray-600 mt-1">
              {(results[bestModel] * 100).toFixed(2)}% accuracy
            </p>
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: '#F8F6F4',
            }}
          >
            <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-2">
              Average Accuracy
            </p>
            <p className="text-lg font-light text-gray-900">
              {(
                entries.reduce((sum, [, acc]) => sum + acc, 0) / entries.length * 100
              ).toFixed(2)}%
            </p>
            <p className="text-sm font-light text-gray-600 mt-1">
              across {entries.length} models
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
