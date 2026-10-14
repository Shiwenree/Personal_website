// The thought cloud villagers think in (Works page fun facts, Village greetings), drawn like the clouds in the painting: a ring of uneven puffs around an oval.
// Each puff is an arc between two points on the oval; bigger gaps make bigger puffs. `fill` is the
// whole shape; `puffs` are the arcs on their own, so each gets its own ink stroke, with small breaks
// between some of them like the hand-drawn clouds in the painting.
export const cloud = (() => {
  const cx = 120, cy = 62, rx = 104, ry = 42;
  const gaps = [1.1, 0.8, 1.25, 0.9, 1.15, 0.75, 1.2, 0.95, 1.05, 0.85, 1.3, 0.9];
  const total = gaps.reduce((a, b) => a + b, 0);
  let angle = -Math.PI / 2;
  const pt = (t: number) => [cx + rx * Math.cos(t), cy + ry * Math.sin(t)].map((n) => n.toFixed(1)).join(' ');
  let d = `M ${pt(angle)}`;
  const puffs: { d: string; low: number }[] = [];
  for (const g of gaps) {
    const next = angle + (g / total) * Math.PI * 2;
    const [x1, y1] = [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
    const [x2, y2] = [cx + rx * Math.cos(next), cy + ry * Math.sin(next)];
    const r = (Math.hypot(x2 - x1, y2 - y1) / 2) * 1.08;
    const arc = `A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${pt(next)}`;
    d += ` ${arc}`;
    // How far down the oval the middle of this puff sits: -1 top, 1 bottom
    const low = Math.sin((angle + next) / 2);
    puffs.push({ d: `M ${pt(angle)} ${arc}`, low });
    angle = next;
  }
  return { fill: d + ' Z', puffs };
})();
// Each puff's ink as [start, length] in % of its arc: most are inked end to end, a few start late
// or stop early, which leaves the small breaks in the outline.
export const puffInk = (_low: number, i: number): [number, number] =>
  ([[0, 100], [8, 92], [0, 100], [0, 78], [0, 100], [14, 86], [0, 100], [0, 82]] as [number, number][])[i % 8];
