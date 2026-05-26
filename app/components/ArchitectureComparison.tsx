'use client';

interface ArchitectureComparisonProps {
  data: Record<string, {
    avg_accuracy: number;
    inference_time: number;
    model_size: string;
    parameters: string;
  }>;
}

export default function ArchitectureComparison({
  data,
}: ArchitectureComparisonProps) {
  const entries = Object.entries(data).sort(
    ([, a], [, b]) => b.avg_accuracy - a.avg_accuracy
  );
  const maxAccuracy = Math.max(...entries.map(([, d]) => d.avg_accuracy));
  const maxTime = Math.max(...entries.map(([, d]) => d.inference_time));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          className="p-4 rounded-2xl border"
          style={{
            backgroundColor: '#F8F6F4',
            borderColor: '#D4C5C1',
          }}
        >
          <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-2">
            Best Accuracy
          </p>
          <p className="text-2xl font-light text-gray-900">
            {(maxAccuracy * 100).toFixed(1)}%
          </p>
          <p className="text-xs font-light text-gray-600 mt-1">
            {entries[0][0]}
          </p>
        </div>
        <div
          className="p-4 rounded-2xl border"
          style={{
            backgroundColor: '#F8F6F4',
            borderColor: '#D4C5C1',
          }}
        >
          <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-2">
            Fastest Inference
          </p>
          <p className="text-2xl font-light text-gray-900">
            {entries.reduce((a, b) =>
              a[1].inference_time < b[1].inference_time ? a : b
            )[1].inference_time}ms
          </p>
          <p className="text-xs font-light text-gray-600 mt-1">
            {entries.reduce((a, b) =>
              a[1].inference_time < b[1].inference_time ? a : b
            )[0]}
          </p>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div
        className="p-5 rounded-2xl border overflow-x-auto"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: '#D4C5C1' }}
            >
              <th className="text-left py-3 px-2 font-light text-gray-600">
                Architecture
              </th>
              <th className="text-left py-3 px-2 font-light text-gray-600">
                Accuracy
              </th>
              <th className="text-left py-3 px-2 font-light text-gray-600">
                Inference
              </th>
              <th className="text-left py-3 px-2 font-light text-gray-600">
                Parameters
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, metrics]) => (
              <tr
                key={name}
                className="border-b hover:bg-opacity-50 transition-all"
                style={{
                  borderColor: '#D4C5C1',
                  backgroundColor: 'transparent',
                }}
              >
                <td className="py-3 px-2 font-light text-gray-900">{name}</td>
                <td className="py-3 px-2 font-light text-gray-800">
                  {(metrics.avg_accuracy * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-2 font-light text-gray-800">
                  {metrics.inference_time}ms
                </td>
                <td className="py-3 px-2 font-light text-gray-800">
                  {metrics.parameters}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Accuracy vs Performance Trade-off */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <p className="text-sm font-light text-gray-700 mb-4">
          Accuracy vs Inference Time
        </p>
        <div className="space-y-3">
          {entries.map(([name, metrics]) => (
            <div key={name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700">{name}</span>
                <span className="text-gray-600">
                  {(metrics.avg_accuracy * 100).toFixed(1)}% / {metrics.inference_time}ms
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EBE5E0' }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(metrics.avg_accuracy / maxAccuracy) * 100}%`,
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
