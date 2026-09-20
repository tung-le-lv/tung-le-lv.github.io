import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  s.box('svc', 260, 0, 240, 80, 'Order service', { fill: 'green' });
  s.frame('dbf', 0, 200, 820, 300, 'Database', { fill: 'pPurple', stroke: '#7048e8', ty: 262 });
  s.frame('txf', 30, 250, 760, 210, 'Single local transaction', { fill: 'white', stroke: '#f08c00', ty: 165, tx: 20 });
  s.box('orders', 60, 300, 330, 110, 'ORDER table\nthe business data', { fill: 'blue' });
  s.box('outbox', 430, 300, 330, 110, 'OUTBOX table\nmessages waiting to be published', { fill: 'orange' });
  s.arrow('svc', 'orders', { fromSide: 'b', toSide: 't', t0: 0.25, t1: 0.5, label: 'INSERT / UPDATE / DELETE', labelAt: [110, 150], labelFs: 17 });
  s.arrow('svc', 'outbox', { fromSide: 'b', toSide: 't', t0: 0.75, t1: 0.5, label: 'INSERT message', labelAt: [660, 150], labelFs: 17 });
  s.box('relay', 960, 305, 220, 100, 'Message relay', { fill: 'purple' });
  s.box('broker', 1330, 305, 220, 100, 'Message broker', { fill: 'yellow' });
  s.arrow('relay', 'outbox', { fromSide: 'l', toSide: 'r', label: '2. reads OUTBOX', labelAt: [865, 285], labelFs: 17 });
  s.arrow('relay', 'broker', { label: '3. publishes', labelAt: [1255, 285], labelFs: 17 });
  s.text(300, 418, '1. all in one ACID transaction', { fs: 16, color: '#e8590c' });
  return { skeleton: s.elements() };
};
