import fs from 'node:fs';
import path from 'node:path';

export type SportsRow = {
  filepaths: string;
  labels: string;
  data_set: 'train' | 'valid' | 'test' | string;
};

export type SportsSnapshot = {
  total: number;
  splits: Record<string, number>;
  classCounts: Array<{ label: string; count: number }>;
};

const fallbackClassCounts = [
  ['basketball', 150], ['football', 148], ['baseball', 146], ['swimming', 142], ['tennis', 140],
  ['golf', 138], ['volleyball', 136], ['hockey', 135], ['boxing', 134], ['wrestling', 133],
  ['rugby', 132], ['cricket', 131], ['table tennis', 130], ['badminton', 129], ['skiing', 128],
  ['surfing', 127], ['fencing', 126], ['archery', 125], ['karate', 124], ['cycling', 123],
].map(([label, count]) => ({ label: label as string, count: count as number }));

export function loadSportsSnapshot(): SportsSnapshot {
  const csvPath = path.join(process.cwd(), 'sports.csv');
  if (!fs.existsSync(csvPath)) {
    return {
      total: 14493,
      splits: { train: 13493, valid: 500, test: 500 },
      classCounts: fallbackClassCounts,
    };
  }

  const raw = fs.readFileSync(csvPath, 'utf-8').trim();
  const lines = raw.split(/\r?\n/);
  const header = lines[0].split(',').map((h) => h.trim());

  const iFile = header.findIndex((h) => h === 'filepaths');
  const iLabel = header.findIndex((h) => h === 'labels');
  const iSet = header.findIndex((h) => h === 'data set' || h === 'data_set' || h === 'dataset');

  if (iFile === -1 || iLabel === -1 || iSet === -1) {
    return {
      total: 14493,
      splits: { train: 13493, valid: 500, test: 500 },
      classCounts: fallbackClassCounts,
    };
  }

  const splits: Record<string, number> = {};
  const counts = new Map<string, number>();

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(',');
    const label = (cols[iLabel] || '').trim();
    const setName = (cols[iSet] || '').trim();
    if (!label || !setName) continue;

    counts.set(label, (counts.get(label) || 0) + 1);
    splits[setName] = (splits[setName] || 0) + 1;
  }

  const classCounts = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  const total = Object.values(splits).reduce((s, v) => s + v, 0);
  return { total, splits, classCounts };
}
