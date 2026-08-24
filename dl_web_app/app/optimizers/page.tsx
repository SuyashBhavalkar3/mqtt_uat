import AnalyticsShell from '../components/AnalyticsShell';
import { optimizerStats, pct } from '@/lib/analytics';

export default function OptimizersPage() {
  const maxAcc = Math.max(...optimizerStats.map((s) => s.avgAcc));
  return (
    <AnalyticsShell title="Optimizer Analytics" subtitle="Aggregate comparison between Adam and SGD across architectures">
      <section className="grid gap-4 md:grid-cols-2">
        {optimizerStats.map((row) => (
          <article key={row.opt} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">{row.opt}</h3>
            <p className="text-sm text-slate-600">Avg Accuracy: {pct(row.avgAcc)}</p>
            <p className="text-sm text-slate-600">Avg Gap: {pct(row.avgGap)}</p>
            <p className="text-sm text-slate-600">Avg Time: {row.avgTime.toFixed(1)}s</p>
            <div className="mt-3 h-3 rounded bg-slate-100"><div className="h-3 rounded bg-indigo-500" style={{ width: `${(row.avgAcc / maxAcc) * 100}%` }} /></div>
          </article>
        ))}
      </section>
    </AnalyticsShell>
  );
}
