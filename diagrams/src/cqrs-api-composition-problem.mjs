import { scene } from '../../scripts/excalidraw/dsl.mjs';
// The problem that motivates CQRS in microservices: joining big datasets in memory.
export default () => {
  const s = scene();
  s.box('cl', 0, 250, 150, 90, 'Client', { fill: 'gray' });
  s.box('api', 240, 235, 260, 120, 'API composer\nin-memory join', { fill: 'red', fs: 20 });
  ['Order service', 'Kitchen service', 'Delivery service', 'Accounting service'].forEach((n, i) => {
    s.box(`sv${i}`, 640, i * 130, 260, 90, n, { fill: 'blue' });
    s.arrow('api', `sv${i}`, { fromSide: 'r', toSide: 'l', t0: 0.12 + i * 0.25 });
  });
  s.arrow('cl', 'api', { both: true });
  s.text(268, 375, 'every call fetches a large dataset', { fs: 16 });
  s.note('n', 180, 470, 470, 110, 'The composer copies the work of a database\nquery engine: pulling everything, then joining\nit in memory. Slow and expensive.', { fill: 'pRed', stroke: '#e03131', fs: 17 });
  return { skeleton: s.elements(), scale: 1.8 };
};
