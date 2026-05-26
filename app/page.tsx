import AnalyticsShell from './components/AnalyticsShell';
import { ranked, optimizerStats, pct, epochAverages } from '@/lib/analytics';

export default function Home() {
  const best = ranked[0];
  const adam = optimizerStats.find((o) => o.opt === 'Adam')!;
  const sgd = optimizerStats.find((o) => o.opt === 'SGD')!;

  return (
    <AnalyticsShell
      title="Lab 6 Analytics Overview"
      subtitle="Assignment-derived dashboard with real ANN/CNN/MobileNet training metrics"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <Card title="Top Model" value={`${best.id} (${pct(best.valAcc)})`} />
        <Card title="Accuracy Lift" value={pct(best.gain)} />
        <Card title="Adam vs SGD" value={pct(adam.avgAcc - sgd.avgAcc)} />
        <Card title="Epoch 3 Mean" value={pct(epochAverages[2])} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Quick Ranking</h2>
        <div className="mt-4 space-y-2">
          {ranked.map((r) => (
            <div key={r.id}>
              <div className="flex justify-between text-xs"><span>{r.id}</span><span>{pct(r.valAcc)}</span></div>
              <div className="h-3 rounded bg-slate-100"><div className="h-3 rounded bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${r.valAcc * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </AnalyticsShell>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{title}</p><p className="mt-2 text-xl font-semibold">{value}</p></article>;
}
