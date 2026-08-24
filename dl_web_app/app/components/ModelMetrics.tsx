interface ModelMetricsProps {
  label: string;
  value: string;
}

export default function ModelMetrics({ label, value }: ModelMetricsProps) {
  return (
    <div
      className="p-7 rounded-3xl border border-opacity-30 shadow-sm transition-all duration-300 hover:shadow-md"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#D4C5C1',
      }}
    >
      <div className="border-l-3 pl-5" style={{ borderLeftColor: '#A67A82' }}>
        <p className="text-xs font-light uppercase tracking-widest" style={{ color: '#888' }}>
          {label}
        </p>
        <p className="text-3xl font-light mt-3" style={{ color: '#4a3f3d' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
