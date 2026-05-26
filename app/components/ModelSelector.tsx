interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export default function ModelSelector({
  models,
  selectedModel,
  onModelSelect,
}: ModelSelectorProps) {
  return (
    <div className="space-y-3">
      {models.map((model) => (
        <label
          key={model}
          className="flex items-center cursor-pointer p-3 rounded-xl transition-all duration-200 hover:bg-opacity-50"
          style={{
            backgroundColor: selectedModel === model ? '#F0E8E5' : 'transparent',
          }}
        >
          <input
            type="radio"
            name="model"
            value={model}
            checked={selectedModel === model}
            onChange={(e) => onModelSelect(e.target.value)}
            className="w-4 h-4"
            style={{ accentColor: '#A67A82' }}
          />
          <span className="ml-3 text-gray-700 font-light text-sm">{model}</span>
        </label>
      ))}
    </div>
  );
}
