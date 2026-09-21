import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  s.box('svc', -40, 70, 210, 100, 'Order service', { fill: 'green' });
  s.frame('dbf', 400, 0, 420, 440, 'Database', { fill: 'pPurple', stroke: '#7048e8' });
  s.box('outbox', 440, 70, 340, 100, 'OUTBOX table', { fill: 'orange' });
  s.box('log', 440, 290, 340, 100, 'Transaction log', { fill: 'gray' });
  s.box('miner', 1010, 290, 260, 100, 'Transaction log\nminer', { fill: 'purple' });
  s.box('broker', 1400, 290, 220, 100, 'Message broker', { fill: 'yellow' });
  s.arrow('svc', 'outbox', { fromSide: 'r', toSide: 'l', label: 'INSERT', labelFs: 17 });
  s.arrow('outbox', 'log', { dashed: true, label: 'recorded in the\ntransaction log', labelFs: 16 });
  s.arrow('log', 'miner', { label: 'changes', labelAt: [915, 270], labelFs: 17 });
  s.arrow('miner', 'broker', { label: 'publish', labelAt: [1335, 270], labelFs: 17 });
  s.note('n1', 0, 330, 340, 100, 'The application only inserts\ninto OUTBOX. It never talks\nto the broker.', {});
  return { skeleton: s.elements() };
};
