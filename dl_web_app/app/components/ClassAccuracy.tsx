'use client';

interface ClassAccuracyProps {
  modelName: string;
  classAccuracy: Record<string, number>;
}

export default function ClassAccuracy({
  modelName,
  classAccuracy,
}: ClassAccuracyProps) {
  const entries = Object.entries(classAccuracy).sort(([, a], [, b]) => b - a);
  const avgAccuracy =
    entries.reduce((sum, [, acc]) => sum + acc, 0) / entries.length;

  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#D4C5C1',
      }}
    >
      <h3 className="text-lg font-light mb-4 text-gray-700">Per-Class Accuracy</h3>

      <div className="space-y-4">
        {entries.map(([className, accuracy]) => (
          <div key={className}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-light text-gray-700 capitalize">
                {className}
              </span>
              <span className="text-sm font-light text-gray-900">
                {(accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: '#EBE5E0' }}
            >
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${accuracy * 100}%`,
                  background: 'linear-gradient(90deg, #A67A82 0%, #D4B8BF 100%)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-6 pt-4 border-t"
        style={{ borderColor: '#D4C5C1' }}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-light text-gray-600">Average Accuracy</span>
          <span className="text-lg font-light text-gray-900">
            {(avgAccuracy * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
