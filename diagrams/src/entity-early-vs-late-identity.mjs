import { scene } from '../../scripts/excalidraw/dsl.mjs';
// Late vs early identity allocation: what breaks when an Entity has no identity until it is saved.
export default () => {
  const s = scene();
  const G = '#2f9e44', R = '#e03131';

  s.frame('late', 0, 0, 700, 600, 'Late: identity assigned on INSERT', { fill: 'pRed', stroke: R, solid: true, fs: 22 });
  [['l1', 30], ['l2', 250], ['l3', 470]].forEach(([id, x]) => s.box(id, x, 70, 200, 80, 'new BacklogItem\nid: null', { fill: 'white', fs: 18 }));
  s.box('lset', 140, 290, 420, 90, 'HashSet<BacklogItem>\nkeeps 1 item', { fill: 'red', fs: 18 });
  [['l1', 0.2], ['l2', 0.5], ['l3', 0.8]].forEach(([id, t1]) => s.arrow(id, 'lset', { fromSide: 'b', toSide: 't', t1 }));
  s.box('levt', 140, 430, 420, 60, 'BacklogItemPlanned(id: null)', { fill: 'red', fs: 18 });
  s.text(30, 515, 'null equals null, so the set drops two items.\nThe event names no item at all.', { fs: 18, color: R });

  s.frame('early', 760, 0, 700, 600, 'Early: identity assigned on construction', { fill: 'pGreen', stroke: G, solid: true, fs: 22 });
  s.box('repo', 920, 60, 380, 60, 'repository.nextIdentity()', { fill: 'blue', fs: 18 });
  [['e1', 790, 'id: B-101'], ['e2', 1010, 'id: B-102'], ['e3', 1230, 'id: B-103']].forEach(([id, x, label], i) => {
    s.box(id, x, 170, 200, 80, `new BacklogItem\n${label}`, { fill: 'white', fs: 18 });
    s.arrow('repo', id, { fromSide: 'b', toSide: 't', t0: [0.15, 0.5, 0.85][i] });
  });
  s.box('eset', 900, 330, 420, 90, 'HashSet<BacklogItem>\nkeeps 3 items', { fill: 'green', fs: 18 });
  [['e1', 0.2], ['e2', 0.5], ['e3', 0.8]].forEach(([id, t1]) => s.arrow(id, 'eset', { fromSide: 'b', toSide: 't', t1 }));
  s.box('eevt', 900, 450, 420, 60, 'BacklogItemPlanned(id: B-101)', { fill: 'green', fs: 18 });
  s.text(790, 530, 'Each item is distinct before it is ever saved,\nand every event can say which item it is about.', { fs: 18, color: G });

  return { skeleton: s.elements() };
};
