interface ModelSpecsProps {
  modelName: string;
  specs: {
    type: string;
    layers: number;
    parameters: string;
    optimizer: string;
    batch_size: number;
    epochs: number;
  };
}

export default function ModelSpecs({ modelName, specs }: ModelSpecsProps) {
  const specItems = [
    { label: 'Architecture', value: specs.type },
    { label: 'Total Layers', value: specs.layers.toString() },
    { label: 'Parameters', value: specs.parameters },
    { label: 'Optimizer', value: specs.optimizer },
    { label: 'Batch Size', value: specs.batch_size.toString() },
    { label: 'Training Epochs', value: specs.epochs.toString() },
  ];

  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#D4C5C1',
      }}
    >
      <h3 className="text-lg font-light mb-4 text-gray-700">{modelName}</h3>
      <div className="space-y-3">
        {specItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between pb-3 border-b border-opacity-20" style={{ borderColor: '#D4C5C1' }}>
            <span className="text-sm font-light text-gray-600">{item.label}</span>
            <span className="text-sm font-light text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
