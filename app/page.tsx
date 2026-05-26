import { datasetStats, modelRuns } from '@/lib/lab6Data';

type Summary = {
  id: string;
  architecture: string;
  optimizer: string;
  valAcc: number;
  trainAcc: number;
  valLoss: number;
  gap: number;
  trainingSeconds: number;
  efficiency: number;
};

const toPct = (v: number) => `${(v * 100).toFixed(2)}%`;
const toSec = (s: number) => `${s}s`;

function polylinePoints(values: number[], width = 580, height = 180) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return values
    .map((value, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((value - min) / Math.max(max - min, 0.0001)) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function Home() {
  const summary: Summary[] = modelRuns.map((run) => {
    const last = run.points[run.points.length - 1];
    const gap = last.accuracy - last.valAccuracy;
    return {
      id: run.id,
      architecture: run.architecture,
      optimizer: run.optimizer,
      valAcc: last.valAccuracy,
      trainAcc: last.accuracy,
      valLoss: last.valLoss,
      gap,
      trainingSeconds: run.trainingSeconds,
      efficiency: last.valAccuracy / run.trainingSeconds,
    };
  });

  const ranked = [...summary].sort((a, b) => b.valAcc - a.valAcc);
  const best = ranked[0];
  const avgValAcc = summary.reduce((s, r) => s + r.valAcc, 0) / summary.length;
  const avgGap = summary.reduce((s, r) => s + r.gap, 0) / summary.length;
  const adamAvg = summary.filter((m) => m.optimizer === 'Adam').reduce((s, r, _, arr) => s + r.valAcc / arr.length, 0);
  const sgdAvg = summary.filter((m) => m.optimizer === 'SGD').reduce((s, r, _, arr) => s + r.valAcc / arr.length, 0);

  const epochVals = [1, 2, 3].map((epoch) => {
    const vals = modelRuns.map((run) => run.points[epoch - 1].valAccuracy);
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-rose-200 bg-white/80 p-6 shadow-lg">
          <h1 className="text-3xl font-bold tracking-tight">Lab 6 Deep Learning Analytics Console</h1>
          <p className="mt-2 text-sm text-slate-600">
            Real metrics extracted from <code>Lab6.ipynb</code> for flower classification ({datasetStats.classCount} classes, {datasetStats.trainImages} train, {datasetStats.valImages} validation).
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric title="Best Validation Accuracy" value={`${best.id} (${toPct(best.valAcc)})`} />
          <Metric title="Average Validation Accuracy" value={toPct(avgValAcc)} />
          <Metric title="Mean Generalization Gap" value={toPct(avgGap)} />
          <Metric title="Optimizer Delta (Adam-SGD)" value={toPct(adamAvg - sgdAvg)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Model Leaderboard</h2>
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th>Model</th><th>Val Acc</th><th>Val Loss</th><th>Gap</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="py-2 font-medium">{row.id}</td>
                    <td>{toPct(row.valAcc)}</td>
                    <td>{row.valLoss.toFixed(4)}</td>
                    <td className={row.gap > 0.12 ? 'text-red-600' : 'text-emerald-700'}>{toPct(row.gap)}</td>
                    <td>{toSec(row.trainingSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Validation Accuracy Trend (Epoch Mean)</h2>
            <svg viewBox="0 0 600 220" className="mt-4 w-full">
              <line x1="0" y1="180" x2="600" y2="180" stroke="#94a3b8" />
              <polyline fill="none" stroke="#2563eb" strokeWidth="4" points={polylinePoints(epochVals)} />
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <circle cx={(i / 2) * 580} cy={180 - ((epochVals[i] - Math.min(...epochVals)) / Math.max(Math.max(...epochVals) - Math.min(...epochVals), 0.0001)) * 180} r="5" fill="#1d4ed8" />
                  <text x={(i / 2) * 580 - 12} y="205" className="fill-slate-600 text-xs">E{i + 1}</text>
                  <text x={(i / 2) * 580 - 18} y="20" className="fill-slate-700 text-xs">{toPct(epochVals[i])}</text>
                </g>
              ))}
            </svg>
            <p className="mt-2 text-xs text-slate-500">Signal: strongest jump appears by epoch 2, with smaller gains by epoch 3.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Per-Model Performance Bars</h2>
          <div className="mt-4 space-y-3">
            {ranked.map((row) => (
              <div key={row.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{row.id}</span>
                  <span>{toPct(row.valAcc)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    style={{ width: `${Math.max(row.valAcc * 100, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </article>
  );
}
