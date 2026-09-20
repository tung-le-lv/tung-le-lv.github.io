import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  const Y = 130;
  s.box('client', 0, Y + 190, 150, 90, 'Client', { fill: 'green' });
  s.box('gw', 250, Y + 190, 190, 90, 'API gateway', { fill: 'gray' });
  s.arrow('client', 'gw', { both: true });
  const bffs = [['dash', 'Internal dashboards\n(GraphQL)', 0], ['web', 'Web app\n(GraphQL)', 1], ['mob', 'Mobile\n(GraphQL)', 2]];
  const svcs = [['pay', 'Payments\nservice', 0], ['vid', 'Video\nservice', 1], ['rep', 'Reporting\nservice', 2]];
  for (const [id, label, i] of bffs) s.box(id, 600, Y + i * 190, 270, 90, label, { fill: 'blue' });
  for (const [id, label, i] of svcs) s.box(id, 1090, Y + i * 190, 260, 90, label, { fill: 'yellow' });
  for (const [id] of bffs) s.arrow('gw', id);
  const links = [['dash', 'pay'], ['dash', 'vid'], ['web', 'vid'], ['web', 'rep'], ['mob', 'rep'], ['mob', 'vid']];
  links.forEach(([a, b], i) => s.arrow(a, b, { both: true, color: '#495057', t0: 0.5 }));
  s.note('n1', 590, 0, 290, 80, 'One GraphQL endpoint\nper client type (a BFF)', { fs: 18 });
  s.note('n2', 1030, 0, 340, 80, 'Each endpoint queries only the\nservices and databases it needs', { fs: 18 });
  s.note('n3', 120, Y + 380, 330, 90, 'Separate endpoints for mobile,\nweb and internal dashboards', { fs: 18 });
  return { skeleton: s.elements() };
};
