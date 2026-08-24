import AnalyticsShell from '../components/AnalyticsShell';
import { modelRuns } from '@/lib/lab6Data';
import { pct } from '@/lib/analytics';

export default function TrainingPage() {
  return (
    <AnalyticsShell title="Training Dynamics" subtitle="Epoch-wise validation progress for each run">
      <section className="grid gap-4 md:grid-cols-2">
        {modelRuns.map((run) => (
          <article key={run.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold">{run.id}</h3>
            <div className="mt-3 space-y-2">
              {run.points.map((p) => (
                <div key={p.epoch}>
                  <div className="flex justify-between text-xs"><span>Epoch {p.epoch}</span><span>{pct(p.valAccuracy)}</span></div>
                  <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-emerald-500" style={{ width: `${p.valAccuracy * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AnalyticsShell>
  );
}
