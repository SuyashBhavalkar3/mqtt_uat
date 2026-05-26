import AnalyticsShell from '../components/AnalyticsShell';
import { architectureStats, pct } from '@/lib/analytics';

export default function ArchitecturePage() {
  return (
    <AnalyticsShell title="Architecture Tradeoffs" subtitle="Accuracy, time, and overfitting profile by model family">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500"><tr><th>Architecture</th><th>Avg Val Acc</th><th>Avg Gap</th><th>Avg Time</th></tr></thead>
          <tbody>
            {architectureStats.map((a) => (
              <tr key={a.arch} className="border-t border-slate-100"><td className="py-2 font-medium">{a.arch}</td><td>{pct(a.avgAcc)}</td><td>{pct(a.avgGap)}</td><td>{a.avgTime.toFixed(1)}s</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </AnalyticsShell>
  );
}
