type Run = {
  id: string;
  model: 'ANN' | 'CNN' | 'MobileNetV2' | 'EfficientNetB0';
  optimizer: 'Adam' | 'SGD' | 'RMSprop';
  lr: number;
  batch: number;
  trainAcc: number;
  valAcc: number;
  trainLoss: number;
  valLoss: number;
  f1: number;
  precision: number;
  recall: number;
  timeSec: number;
  epochs: [number, number, number, number, number];
};

const runs: Run[] = [
  { id: 'ANN_Adam', model: 'ANN', optimizer: 'Adam', lr: 0.001, batch: 32, trainAcc: 0.84, valAcc: 0.77, trainLoss: 0.41, valLoss: 0.62, f1: 0.75, precision: 0.76, recall: 0.74, timeSec: 140, epochs: [0.54, 0.63, 0.70, 0.74, 0.77] },
  { id: 'ANN_SGD', model: 'ANN', optimizer: 'SGD', lr: 0.001, batch: 32, trainAcc: 0.78, valAcc: 0.71, trainLoss: 0.52, valLoss: 0.75, f1: 0.69, precision: 0.70, recall: 0.68, timeSec: 118, epochs: [0.50, 0.58, 0.64, 0.68, 0.71] },
  { id: 'ANN_RMSprop', model: 'ANN', optimizer: 'RMSprop', lr: 0.001, batch: 32, trainAcc: 0.82, valAcc: 0.74, trainLoss: 0.46, valLoss: 0.68, f1: 0.72, precision: 0.73, recall: 0.71, timeSec: 132, epochs: [0.52, 0.61, 0.67, 0.71, 0.74] },

  { id: 'CNN_Adam', model: 'CNN', optimizer: 'Adam', lr: 0.001, batch: 32, trainAcc: 0.92, valAcc: 0.84, trainLoss: 0.23, valLoss: 0.43, f1: 0.83, precision: 0.84, recall: 0.82, timeSec: 305, epochs: [0.63, 0.72, 0.78, 0.82, 0.84] },
  { id: 'CNN_SGD', model: 'CNN', optimizer: 'SGD', lr: 0.001, batch: 32, trainAcc: 0.86, valAcc: 0.78, trainLoss: 0.34, valLoss: 0.55, f1: 0.76, precision: 0.78, recall: 0.74, timeSec: 284, epochs: [0.59, 0.67, 0.72, 0.76, 0.78] },
  { id: 'CNN_RMSprop', model: 'CNN', optimizer: 'RMSprop', lr: 0.001, batch: 32, trainAcc: 0.89, valAcc: 0.81, trainLoss: 0.29, valLoss: 0.49, f1: 0.79, precision: 0.80, recall: 0.78, timeSec: 294, epochs: [0.61, 0.70, 0.75, 0.79, 0.81] },

  { id: 'MobileNetV2_Adam', model: 'MobileNetV2', optimizer: 'Adam', lr: 0.0005, batch: 32, trainAcc: 0.96, valAcc: 0.89, trainLoss: 0.14, valLoss: 0.31, f1: 0.88, precision: 0.89, recall: 0.87, timeSec: 402, epochs: [0.72, 0.80, 0.85, 0.88, 0.89] },
  { id: 'MobileNetV2_SGD', model: 'MobileNetV2', optimizer: 'SGD', lr: 0.0005, batch: 32, trainAcc: 0.90, valAcc: 0.83, trainLoss: 0.27, valLoss: 0.46, f1: 0.81, precision: 0.83, recall: 0.80, timeSec: 388, epochs: [0.66, 0.74, 0.79, 0.82, 0.83] },
  { id: 'MobileNetV2_RMSprop', model: 'MobileNetV2', optimizer: 'RMSprop', lr: 0.0005, batch: 32, trainAcc: 0.94, valAcc: 0.87, trainLoss: 0.18, valLoss: 0.35, f1: 0.85, precision: 0.86, recall: 0.84, timeSec: 395, epochs: [0.70, 0.78, 0.83, 0.86, 0.87] },

  { id: 'EfficientNetB0_Adam', model: 'EfficientNetB0', optimizer: 'Adam', lr: 0.0005, batch: 24, trainAcc: 0.97, valAcc: 0.91, trainLoss: 0.12, valLoss: 0.28, f1: 0.90, precision: 0.91, recall: 0.89, timeSec: 470, epochs: [0.75, 0.83, 0.87, 0.90, 0.91] },
  { id: 'EfficientNetB0_SGD', model: 'EfficientNetB0', optimizer: 'SGD', lr: 0.0005, batch: 24, trainAcc: 0.92, valAcc: 0.85, trainLoss: 0.24, valLoss: 0.40, f1: 0.83, precision: 0.84, recall: 0.82, timeSec: 451, epochs: [0.69, 0.76, 0.81, 0.84, 0.85] },
  { id: 'EfficientNetB0_RMSprop', model: 'EfficientNetB0', optimizer: 'RMSprop', lr: 0.0005, batch: 24, trainAcc: 0.95, valAcc: 0.88, trainLoss: 0.16, valLoss: 0.34, f1: 0.86, precision: 0.87, recall: 0.85, timeSec: 462, epochs: [0.73, 0.80, 0.84, 0.87, 0.88] },
];

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

export default function Home() {
  const ranked = [...runs].sort((a, b) => b.valAcc - a.valAcc);
  const best = ranked[0];

  const optimizerSummary = ['Adam', 'SGD', 'RMSprop'].map((opt) => {
    const rows = runs.filter((r) => r.optimizer === opt);
    return {
      opt,
      valAcc: rows.reduce((s, r) => s + r.valAcc, 0) / rows.length,
      f1: rows.reduce((s, r) => s + r.f1, 0) / rows.length,
      time: rows.reduce((s, r) => s + r.timeSec, 0) / rows.length,
      gap: rows.reduce((s, r) => s + (r.trainAcc - r.valAcc), 0) / rows.length,
    };
  });

  const modelSummary = ['ANN', 'CNN', 'MobileNetV2', 'EfficientNetB0'].map((model) => {
    const rows = runs.filter((r) => r.model === model);
    return {
      model,
      valAcc: rows.reduce((s, r) => s + r.valAcc, 0) / rows.length,
      f1: rows.reduce((s, r) => s + r.f1, 0) / rows.length,
      time: rows.reduce((s, r) => s + r.timeSec, 0) / rows.length,
      best: [...rows].sort((a, b) => b.valAcc - a.valAcc)[0],
    };
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-blue-200 bg-white/90 p-6 shadow-lg">
          <h1 className="text-3xl font-bold tracking-tight">Multi-Model Multi-Optimizer Performance Analytics</h1>
          <p className="mt-1 text-sm text-slate-600">Permutation matrix across architectures and optimizers with long-form performance analysis.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Kpi title="Total Experiments" value={`${runs.length}`} />
          <Kpi title="Best Run" value={`${best.id} (${pct(best.valAcc)})`} />
          <Kpi title="Top Macro F1" value={pct(Math.max(...runs.map((r) => r.f1)))} />
          <Kpi title="Fastest Runtime" value={`${Math.min(...runs.map((r) => r.timeSec))}s`} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">1. Full Permutation Leaderboard</h2>
          <div className="mt-4 space-y-2">
            {ranked.map((r) => (
              <div key={r.id}>
                <div className="flex justify-between text-xs"><span>{r.id}</span><span>{pct(r.valAcc)}</span></div>
                <div className="h-3 rounded bg-slate-100"><div className="h-3 rounded bg-gradient-to-r from-blue-500 to-cyan-600" style={{ width: `${r.valAcc * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-semibold">2. Experiment Table</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-slate-500"><tr><th>Run</th><th>Model</th><th>Optimizer</th><th>LR</th><th>Batch</th><th>Train Acc</th><th>Val Acc</th><th>F1</th><th>Precision</th><th>Recall</th><th>Val Loss</th><th>Time</th></tr></thead>
            <tbody>
              {ranked.map((r) => (
                <tr key={r.id} className="border-t border-slate-100"><td className="py-2 font-medium">{r.id}</td><td>{r.model}</td><td>{r.optimizer}</td><td>{r.lr}</td><td>{r.batch}</td><td>{pct(r.trainAcc)}</td><td>{pct(r.valAcc)}</td><td>{pct(r.f1)}</td><td>{pct(r.precision)}</td><td>{pct(r.recall)}</td><td>{r.valLoss.toFixed(3)}</td><td>{r.timeSec}s</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {optimizerSummary.map((o) => (
            <article key={o.opt} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">3. Optimizer: {o.opt}</h3>
              <p className="mt-2 text-sm">Avg Val Acc: {pct(o.valAcc)}</p>
              <p className="text-sm">Avg F1: {pct(o.f1)}</p>
              <p className="text-sm">Avg Runtime: {o.time.toFixed(1)}s</p>
              <p className="text-sm">Avg Gen Gap: {pct(o.gap)}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {modelSummary.map((m) => (
            <article key={m.model} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">4. Model Family: {m.model}</h3>
              <p className="mt-2 text-sm">Average Validation Accuracy: {pct(m.valAcc)}</p>
              <p className="text-sm">Average Macro F1: {pct(m.f1)}</p>
              <p className="text-sm">Average Runtime: {m.time.toFixed(1)}s</p>
              <p className="text-sm">Best Variant: {m.best.id} ({pct(m.best.valAcc)})</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-semibold">5. Epoch Progression Matrix</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-slate-500"><tr><th>Run</th><th>E1</th><th>E2</th><th>E3</th><th>E4</th><th>E5</th><th>E1?E5 Gain</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{r.id}</td>
                  <td>{pct(r.epochs[0])}</td><td>{pct(r.epochs[1])}</td><td>{pct(r.epochs[2])}</td><td>{pct(r.epochs[3])}</td><td>{pct(r.epochs[4])}</td>
                  <td>{pct(r.epochs[4] - r.epochs[0])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">6. Generalization Risk View</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {ranked
              .map((r) => ({ ...r, gap: r.trainAcc - r.valAcc }))
              .sort((a, b) => b.gap - a.gap)
              .map((r) => (
                <article key={r.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-medium">{r.id}</p>
                  <p className="text-xs text-slate-600">Generalization Gap: {pct(r.gap)}</p>
                  <p className="text-xs text-slate-600">Train {pct(r.trainAcc)} vs Val {pct(r.valAcc)}</p>
                </article>
              ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">7. Performance Insights</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>Adam consistently ranks higher in validation accuracy across all model families, with strongest lift on transfer-learning architectures.</p>
            <p>RMSprop offers a balanced middle ground, producing stable F1 with moderate runtime overhead.</p>
            <p>SGD variants show lower validation ceilings in this matrix but competitive runtime in smaller architectures.</p>
            <p>EfficientNetB0 + Adam is the top-performing permutation in accuracy and F1, while ANN + SGD remains the lightweight baseline.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </article>
  );
}
