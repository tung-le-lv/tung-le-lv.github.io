import { scene } from '../../scripts/excalidraw/dsl.mjs';
// The same Scrum concepts as one large cluster, then as four Aggregates that share only an identity.
export default () => {
  const s = scene();
  const G = '#2f9e44', R = '#e03131', B = '#1971c2';

  s.frame('big', 0, 0, 660, 530, 'Before: one large-cluster Aggregate', { fill: 'pRed', stroke: R, solid: true, fs: 22 });
  s.box('product', 130, 70, 400, 100, 'Product (root)\none version for everything', { fill: 'yellow' });
  const stack = (id, x, label) => {
    s.box(`${id}-back`, x + 10, 270, 185, 100, '', { fill: 'white' });
    s.box(id, x, 260, 185, 100, label, { fill: 'white', fs: 18 });
  };
  stack('items', 25, 'BacklogItems\nthousands');
  stack('rels', 235, 'Releases\nmany');
  stack('sprs', 445, 'Sprints\nmany');
  [['items', 0.15], ['rels', 0.5], ['sprs', 0.85]].forEach(([id, t0]) => s.arrow('product', id, { fromSide: 'b', toSide: 't', t0 }));
  s.text(30, 410, 'Every addition bumps the same version, so unrelated\nrequests collide. Adding one item can mean loading\nthousands of others.', { fs: 18, color: R });

  s.frame('small', 720, 0, 720, 530, 'After: four small Aggregates', { fill: 'pGreen', stroke: G, solid: true, fs: 22 });
  s.box('p2', 900, 70, 360, 100, 'Product (root)\nits own version', { fill: 'yellow' });
  [['b2', 745, 'BacklogItem (root)', 0.2], ['r2', 975, 'Release (root)', 0.5], ['s2', 1205, 'Sprint (root)', 0.8]].forEach(([id, x, name, t1]) => {
    s.box(id, x, 280, 210, 100, `${name}\nits own version`, { fill: 'yellow', fs: 17 });
    s.arrow(id, 'p2', { fromSide: 't', toSide: 'b', t1, dashed: true, color: B, ...(id === 'r2' ? { label: 'ProductId only', labelFs: 18 } : {}) });
  });
  s.text(750, 410, 'Planning a BacklogItem can no longer collide with\nscheduling a Release. Each one loads on its own,\nand each stays small.', { fs: 18, color: G });

  return { skeleton: s.elements() };
};
