import { modelRuns } from './lab6Data';

export const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

export const summaries = modelRuns.map((run) => {
  const last = run.points[run.points.length - 1];
  return {
    id: run.id,
    architecture: run.architecture,
    optimizer: run.optimizer,
    trainingSeconds: run.trainingSeconds,
    trainAcc: last.accuracy,
    valAcc: last.valAccuracy,
    trainLoss: last.loss,
    valLoss: last.valLoss,
    gap: last.accuracy - last.valAccuracy,
    gain: run.points[run.points.length - 1].valAccuracy - run.points[0].valAccuracy,
  };
});

export const ranked = [...summaries].sort((a, b) => b.valAcc - a.valAcc);

export const optimizerStats = ['Adam', 'SGD'].map((opt) => {
  const rows = summaries.filter((r) => r.optimizer === opt);
  const avgAcc = rows.reduce((s, r) => s + r.valAcc, 0) / rows.length;
  const avgGap = rows.reduce((s, r) => s + r.gap, 0) / rows.length;
  const avgTime = rows.reduce((s, r) => s + r.trainingSeconds, 0) / rows.length;
  return { opt, avgAcc, avgGap, avgTime };
});

export const architectureStats = ['ANN', 'CNN', 'Freeze', 'Unfreeze'].map((arch) => {
  const rows = summaries.filter((r) => r.architecture === arch);
  return {
    arch,
    avgAcc: rows.reduce((s, r) => s + r.valAcc, 0) / rows.length,
    avgGap: rows.reduce((s, r) => s + r.gap, 0) / rows.length,
    avgTime: rows.reduce((s, r) => s + r.trainingSeconds, 0) / rows.length,
  };
});

export const epochAverages = [0, 1, 2].map((i) => {
  const values = modelRuns.map((run) => run.points[i].valAccuracy);
  return values.reduce((s, v) => s + v, 0) / values.length;
});
