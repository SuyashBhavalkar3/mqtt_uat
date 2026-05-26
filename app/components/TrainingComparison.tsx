'use client';

import { trainingHistory } from '@/lib/mockData';

export default function TrainingComparison() {
  const models = Object.keys(trainingHistory);
  const selectedModels = ['ANN_Adam', 'CNN_Adam', 'Freeze_Adam', 'Unfreeze_Adam'];

  return (
    <div className="space-y-8">
      {/* Accuracy Comparison Across Models */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          backgroundColor: '#F8F6F4',
          borderColor: '#D4C5C1',
        }}
      >
        <h4 className="text-sm font-light text-gray-700 mb-6">
          Validation Accuracy Progression
        </h4>
        <div className="space-y-4">
          {selectedModels.map((modelName) => {
            const history = trainingHistory[modelName];
            const maxAcc = 1;

            return (
              <div key={modelName}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-light text-gray-700">
                    {modelName}
                  </span>
                  <div className="flex gap-2">
                    {history.val_accuracy.map((acc, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-light text-gray-600"
                      >
                        Ep{idx + 1}: {(acc * 100).toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 h-8">
                  {history.val_accuracy.map((acc, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-lg transition-all duration-500 hover:shadow-md relative group"
                      style={{
                        height: `${(acc / maxAcc) * 100}%`,
                        background: 'linear-gradient(180deg, #A67A82 0%, #D4B8BF 100%)',
                      }}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {(acc * 100).toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loss Comparison */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          backgroundColor: '#F8F6F4',
          borderColor: '#D4C5C1',
        }}
      >
        <h4 className="text-sm font-light text-gray-700 mb-6">
          Validation Loss Progression
        </h4>
        <div className="space-y-4">
          {selectedModels.map((modelName) => {
            const history = trainingHistory[modelName];
            const maxLoss = Math.max(
              ...selectedModels.flatMap((m) => trainingHistory[m].val_loss)
            );

            return (
              <div key={modelName}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-light text-gray-700">
                    {modelName}
                  </span>
                  <span className="text-xs font-light text-gray-600">
                    Final: {history.val_loss[history.val_loss.length - 1].toFixed(3)}
                  </span>
                </div>
                <div className="flex gap-1 h-8">
                  {history.val_loss.map((loss, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-lg transition-all duration-500 hover:shadow-md"
                      style={{
                        height: `${(loss / maxLoss) * 100}%`,
                        background: 'linear-gradient(180deg, #DC6464 0%, #F0A0A0 100%)',
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Training Efficiency */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          backgroundColor: '#F8F6F4',
          borderColor: '#D4C5C1',
        }}
      >
        <h4 className="text-sm font-light text-gray-700 mb-6">
          Training Time Comparison
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {selectedModels.map((modelName) => {
            const history = trainingHistory[modelName];
            const maxTime = Math.max(
              ...selectedModels.map((m) => trainingHistory[m].training_time)
            );

            return (
              <div
                key={modelName}
                className="p-4 rounded-lg border text-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D4C5C1',
                }}
              >
                <p className="text-xs font-light text-gray-500 uppercase mb-2">
                  {modelName}
                </p>
                <p className="text-2xl font-light text-gray-900 mb-2">
                  {history.training_time}s
                </p>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#EBE5E0' }}
                >
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${(history.training_time / maxTime) * 100}%`,
                      background: 'linear-gradient(90deg, #A67A82 0%, #D4B8BF 100%)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
