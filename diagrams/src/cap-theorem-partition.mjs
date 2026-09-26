import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();

  s.frame('dc1', 0, 0, 460, 380, 'Data center 1', { fill: 'pBlue', stroke: '#1c7ed6', ty: 340 });
  s.box('app1', 40, 40, 380, 90, 'Inventory service', { fill: 'blue' });
  s.db('db1', 100, 190, 260, 150, 'Inventory DB\n(primary)', { fill: 'blue' });
  s.arrow('app1', 'db1', { label: 'reads / writes' });

  s.frame('dc2', 760, 0, 460, 380, 'Data center 2', { fill: 'pGreen', stroke: '#2f9e44', ty: 340 });
  s.box('app2', 800, 40, 380, 90, 'Inventory service', { fill: 'green' });
  s.db('db2', 860, 190, 260, 150, 'Inventory DB\n(primary)', { fill: 'green' });
  s.arrow('app2', 'db2', { label: 'reads / writes' });

  s.arrow('db1', 'db2', {
    fromSide: 'r', toSide: 'l', dashed: true, color: '#e03131', both: true,
    label: 'replication ✗\nnetwork partition', labelFs: 18, labelColor: '#e03131',
  });

  return { skeleton: s.elements() };
};
