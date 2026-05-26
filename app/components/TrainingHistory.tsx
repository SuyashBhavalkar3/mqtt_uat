'use client';

interface TrainingHistoryProps {
  modelName: string;
  history: {
    epochs: number[];
    loss: number[];
    val_loss: number[];
    accuracy: number[];
    val_accuracy: number[];
    training_time: number;
  };
}

export default function TrainingHistory({
  modelName,
  history,
}: TrainingHistoryProps) {
  const maxLoss = Math.max(...history.loss, ...history.val_loss);
  const maxAccuracy = 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Training Info */}
        <div
          className="p-4 rounded-2xl border"
          style={{
            backgroundColor: '#F8F6F4',
            borderColor: '#D4C5C1',
          }}
        >
          <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-2">
            Training Time
          </p>
          <p className="text-2xl font-light text-gray-900">
            {history.training_time}s
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
            Final Accuracy
          </p>
          <p className="text-2xl font-light text-gray-900">
            {(history.val_accuracy[history.val_accuracy.length - 1] * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Accuracy Curve */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <p className="text-sm font-light text-gray-700 mb-4">Accuracy Over Epochs</p>
        <div className="h-40 flex items-end justify-between gap-2 mb-2">
          {history.epochs.map((epoch, i) => (
            <div key={epoch} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative h-32 w-full flex items-end justify-center gap-1">
                <div
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${(history.accuracy[i] / maxAccuracy) * 100}%`,
                    backgroundColor: 'rgba(166, 122, 130, 0.3)',
                  }}
                  title={`Train: ${(history.accuracy[i] * 100).toFixed(1)}%`}
                />
                <div
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${(history.val_accuracy[i] / maxAccuracy) * 100}%`,
                    backgroundColor: '#A67A82',
                  }}
                  title={`Val: ${(history.val_accuracy[i] * 100).toFixed(1)}%`}
                />
              </div>
              <span className="text-xs text-gray-600">Ep {epoch}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: 'rgba(166, 122, 130, 0.3)' }}
            />
            <span className="text-gray-600">Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: '#A67A82' }}
            />
            <span className="text-gray-600">Validation</span>
          </div>
        </div>
      </div>

      {/* Loss Curve */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#D4C5C1',
        }}
      >
        <p className="text-sm font-light text-gray-700 mb-4">Loss Over Epochs</p>
        <div className="h-40 flex items-end justify-between gap-2 mb-2">
          {history.epochs.map((epoch, i) => (
            <div key={epoch} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative h-32 w-full flex items-end justify-center gap-1">
                <div
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${(history.loss[i] / maxLoss) * 100}%`,
                    backgroundColor: 'rgba(220, 100, 100, 0.3)',
                  }}
                  title={`Train: ${history.loss[i].toFixed(3)}`}
                />
                <div
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${(history.val_loss[i] / maxLoss) * 100}%`,
                    backgroundColor: '#DC6464',
                  }}
                  title={`Val: ${history.val_loss[i].toFixed(3)}`}
                />
              </div>
              <span className="text-xs text-gray-600">Ep {epoch}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: 'rgba(220, 100, 100, 0.3)' }}
            />
            <span className="text-gray-600">Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: '#DC6464' }}
            />
            <span className="text-gray-600">Validation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
