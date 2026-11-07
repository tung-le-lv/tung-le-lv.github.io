import { scene } from '../../scripts/excalidraw/dsl.mjs';
// Object reference vs identity reference: what each one lets a transaction and a data store do.
export default () => {
  const s = scene();
  const G = '#2f9e44', R = '#e03131', B = '#1971c2';

  s.frame('ptr', 0, 0, 660, 500, 'Direct object reference', { fill: 'pRed', stroke: R, solid: true, fs: 22 });
  s.box('b1', 30, 70, 220, 90, 'BacklogItem', { fill: 'yellow' });
  s.box('p1', 410, 70, 220, 90, 'Product', { fill: 'yellow' });
  s.arrow('b1', 'p1', { color: R, label: 'product', labelFs: 18 });
  s.db('db', 170, 215, 320, 110, 'One database', { fill: 'blue' });
  s.arrow('b1', 'db', { fromSide: 'b', toSide: 't', t1: 0.15 });
  s.arrow('p1', 'db', { fromSide: 'b', toSide: 't', t1: 0.85 });
  s.text(30, 360, 'A single transaction can easily change both.\nAn ORM can load Product just by following the field.\nNeither can move to another store on its own.', { fs: 18, color: R });

  s.frame('id', 720, 0, 660, 500, 'Reference by identity', { fill: 'pGreen', stroke: G, solid: true, fs: 22 });
  s.box('b2', 750, 70, 220, 90, 'BacklogItem\nholds productId', { fill: 'yellow', fs: 18 });
  s.box('p2', 1130, 70, 220, 90, 'Product', { fill: 'yellow' });
  s.arrow('b2', 'p2', { dashed: true, color: B, label: 'id only', labelFs: 18 });
  s.db('d1', 750, 215, 220, 110, 'Backlog\nstore', { fill: 'blue' });
  s.db('d2', 1130, 215, 220, 110, 'Product\nstore', { fill: 'green' });
  s.arrow('b2', 'd1', { fromSide: 'b', toSide: 't' });
  s.arrow('p2', 'd2', { fromSide: 'b', toSide: 't' });
  s.text(750, 360, 'There is nothing to navigate, so the second Aggregate\ntakes a deliberate repository call to reach.\nEach loads, and can be partitioned, on its own.', { fs: 18, color: G });

  return { skeleton: s.elements() };
};
