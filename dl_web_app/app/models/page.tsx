import AnalyticsShell from '../components/AnalyticsShell';
import { ranked, pct } from '@/lib/analytics';

export default function ModelsPage() {
  return (
    <AnalyticsShell title="Model Leaderboard" subtitle="Final validation metrics, generalization gap, and training efficiency">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500"><tr><th>Model</th><th>Val Acc</th><th>Train Acc</th><th>Gap</th><th>Val Loss</th><th>Train Time</th></tr></thead>
          <tbody>
            {ranked.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{m.id}</td><td>{pct(m.valAcc)}</td><td>{pct(m.trainAcc)}</td><td>{pct(m.gap)}</td><td>{m.valLoss.toFixed(4)}</td><td>{m.trainingSeconds}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AnalyticsShell>
  );
}
