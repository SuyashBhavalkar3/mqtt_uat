import AnalyticsShell from '../components/AnalyticsShell';
import { datasetStats } from '@/lib/lab6Data';

const classScores = [
  { label: 'daisy', score: 0.74 },
  { label: 'dandelion', score: 0.69 },
  { label: 'rose', score: 0.71 },
  { label: 'sunflower', score: 0.78 },
  { label: 'tulip', score: 0.68 },
];

export default function ClassesPage() {
  return (
    <AnalyticsShell title="Class-wise Analytics" subtitle="Class balance and per-class score profile (aggregated estimate from notebook runs)">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Classes: {datasetStats.classes.join(', ')}</p>
        <div className="mt-4 space-y-3">
          {classScores.map((c) => (
            <div key={c.label}>
              <div className="mb-1 flex justify-between text-xs"><span>{c.label}</span><span>{(c.score * 100).toFixed(1)}%</span></div>
              <div className="h-3 rounded bg-slate-100"><div className="h-3 rounded bg-gradient-to-r from-amber-500 to-rose-500" style={{ width: `${c.score * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </AnalyticsShell>
  );
}
