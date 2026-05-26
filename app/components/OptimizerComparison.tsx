'use client';

interface OptimizerComparisonProps {
  data: Record<string, {
    learning_rate: number;
    avg_accuracy: number;
    avg_loss: number;
    training_efficiency: string;
  }>;
}

export default function OptimizerComparison({
  data,
}: OptimizerComparisonProps) {
  const maxAccuracy = Math.max(
    ...Object.values(data).map((d) => d.avg_accuracy)
  );

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([name, metrics]) => (
        <div
          key={name}
          className="p-5 rounded-2xl border"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#D4C5C1',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-gray-700">{name}</h3>
            <div
              className="px-3 py-1 rounded-full text-xs font-light"
              style={{
                backgroundColor: '#F8F6F4',
                color: '#4a3f3d',
              }}
            >
              {metrics.training_efficiency}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-1">
                Learning Rate
              </p>
              <p className="text-lg font-light text-gray-900">
                {metrics.learning_rate}
              </p>
            </div>
            <div>
              <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-1">
                Avg Accuracy
              </p>
              <p className="text-lg font-light text-gray-900">
                {(metrics.avg_accuracy * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-light text-gray-600 mb-2">
              Accuracy Distribution
            </p>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: '#EBE5E0' }}
            >
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(metrics.avg_accuracy / maxAccuracy) * 100}%`,
                  background: 'linear-gradient(90deg, #A67A82 0%, #D4B8BF 100%)',
                }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#D4C5C1' }}>
            <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-1">
              Avg Loss
            </p>
            <p className="text-sm font-light text-gray-900">
              {metrics.avg_loss.toFixed(3)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
