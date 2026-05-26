import { loadSportsSnapshot } from '@/lib/sportsData';

function pct(v: number) {
  return `${(v * 100).toFixed(2)}%`;
}

export default function Home() {
  const snapshot = loadSportsSnapshot();
  const train = snapshot.splits.train ?? snapshot.splits.Train ?? 0;
  const valid = snapshot.splits.valid ?? snapshot.splits.Valid ?? 0;
  const test = snapshot.splits.test ?? snapshot.splits.Test ?? 0;
  const classTotal = snapshot.classCounts.length;

  const trainPct = snapshot.total > 0 ? train / snapshot.total : 0;
  const validPct = snapshot.total > 0 ? valid / snapshot.total : 0;
  const testPct = snapshot.total > 0 ? test / snapshot.total : 0;

  const concentrationTop10 = snapshot.classCounts.slice(0, 10).reduce((s, c) => s + c.count, 0);
  const concentrationPct = snapshot.total > 0 ? concentrationTop10 / snapshot.total : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-cyan-200 bg-white/85 p-6 shadow-lg">
          <h1 className="text-3xl font-bold tracking-tight">Sports Classification Analytics Console</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pivoted to Kaggle Sports Classification dataset with long-scroll analytics sections and dataset-specific insights.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            If <code>sports.csv</code> exists at repo root, this page uses real CSV counts automatically.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <Kpi title="Total Images" value={snapshot.total.toLocaleString()} />
          <Kpi title="Train Split" value={`${train.toLocaleString()} (${pct(trainPct)})`} />
          <Kpi title="Valid Split" value={`${valid.toLocaleString()} (${pct(validPct)})`} />
          <Kpi title="Test Split" value={`${test.toLocaleString()} (${pct(testPct)})`} />
          <Kpi title="Classes (shown)" value={classTotal.toString()} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">1. Split Distribution</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: 'train', count: train, color: 'from-blue-500 to-blue-700' },
              { label: 'valid', count: valid, color: 'from-amber-500 to-orange-600' },
              { label: 'test', count: test, color: 'from-emerald-500 to-green-700' },
            ].map((s) => {
              const w = snapshot.total > 0 ? (s.count / snapshot.total) * 100 : 0;
              return (
                <div key={s.label}>
                  <div className="mb-1 flex justify-between text-xs"><span>{s.label}</span><span>{s.count.toLocaleString()}</span></div>
                  <div className="h-3 rounded bg-slate-100"><div className={`h-3 rounded bg-gradient-to-r ${s.color}`} style={{ width: `${w}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">2. Class Frequency (Top 30)</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {snapshot.classCounts.map((row) => {
              const width = snapshot.classCounts[0] ? (row.count / snapshot.classCounts[0].count) * 100 : 0;
              return (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-xs"><span>{row.label}</span><span>{row.count}</span></div>
                  <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-cyan-600" style={{ width: `${width}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">3. Dataset Health Signals</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
              <li>Total class concentration in top 10 classes: {pct(concentrationPct)}.</li>
              <li>Train-heavy split supports transfer learning and augmentation workflows.</li>
              <li>Small fixed validation/test sets indicate monitoring for variance across runs is important.</li>
              <li>Recommended: add confusion matrix + macro-F1 tracking in training logs.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">4. Modeling Blueprint</h2>
            <ol className="mt-3 list-decimal pl-5 text-sm text-slate-700">
              <li>Baseline: EfficientNet-B0 / MobileNetV3 with frozen backbone.</li>
              <li>Phase-2: gradual unfreeze + cosine LR schedule for fine-tuning.</li>
              <li>Metrics: top-1 accuracy, macro precision/recall/F1, per-class recall.</li>
              <li>Error analysis: class confusion clusters (e.g., court/field sports).</li>
            </ol>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-semibold">5. Execution Plan (Fast)</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-slate-500"><tr><th>Phase</th><th>Objective</th><th>Output</th><th>ETA</th></tr></thead>
            <tbody>
              <tr className="border-t"><td className="py-2">Data Audit</td><td>Validate split + class counts</td><td>Profiling report JSON</td><td>20 min</td></tr>
              <tr className="border-t"><td className="py-2">Baseline Train</td><td>Fast transfer-learning benchmark</td><td>Best checkpoint + metrics</td><td>45-60 min</td></tr>
              <tr className="border-t"><td className="py-2">Fine-Tune</td><td>Improve macro performance</td><td>Comparison sheet</td><td>60-90 min</td></tr>
              <tr className="border-t"><td className="py-2">Deploy</td><td>Inference + analytics UI</td><td>Web app module</td><td>30 min</td></tr>
            </tbody>
          </table>
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
