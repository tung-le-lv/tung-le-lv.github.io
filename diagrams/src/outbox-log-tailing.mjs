import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  s.box('svc', 0, 110, 230, 100, 'Order service', { fill: 'green' });
  s.frame('dbf', 400, 0, 420, 400, 'Database', { fill: 'pPurple', stroke: '#7048e8' });
  s.box('outbox', 440, 70, 340, 100, 'OUTBOX table', { fill: 'orange' });
  s.box('log', 440, 250, 340, 100, 'Transaction log', { fill: 'gray' });
  s.box('miner', 1010, 250, 260, 100, 'Transaction log\nminer', { fill: 'purple' });
  s.box('broker', 1400, 250, 220, 100, 'Message broker', { fill: 'yellow' });
  s.arrow('svc', 'outbox', { fromSide: 'r', toSide: 'l', t0: 0.4, label: 'INSERT INTO\nOUTBOX ...', labelAt: [320, 90], labelFs: 17 });
  s.arrow('outbox', 'log', { dashed: true, label: 'every committed insert\nis recorded', labelAt: [610, 210], labelFs: 16 });
  s.arrow('log', 'miner', { label: 'changes', labelAt: [915, 270], labelFs: 17 });
  s.arrow('miner', 'broker', { label: 'publish', labelAt: [1335, 270], labelFs: 17 });
  s.note('n1', 0, 300, 340, 100, 'The application only inserts\ninto OUTBOX. It never talks\nto the broker.', {});
  return { skeleton: s.elements() };
};
