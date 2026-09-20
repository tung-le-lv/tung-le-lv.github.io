import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  s.box('client', 0, 75, 150, 90, 'Client', { fill: 'gray' });
  s.frame('appf', 260, 0, 400, 420, 'Application', { fill: 'pBlue', stroke: '#1c7ed6', ty: 380 });
  s.box('api', 300, 75, 320, 90, 'API', { fill: 'blue' });
  s.box('worker', 300, 285, 320, 90, 'Worker process', { fill: 'orange' });
  s.frame('dbf', 900, 20, 420, 380, 'Database (one transaction)', { fill: 'pPurple', stroke: '#7048e8', ty: 340 });
  s.box('users', 940, 90, 340, 100, 'Users table', { fill: 'yellow' });
  s.box('outbox', 940, 240, 340, 100, 'Outbox table', { fill: 'purple' });
  s.box('bus', 300, 520, 320, 100, 'Message bus', { fill: 'green' });
  s.arrow('client', 'api', { label: '1. request', labelAt: [208, 92], labelFs: 17 });
  s.arrow('api', 'users', { fromSide: 'r', toSide: 'l', t0: 0.4, via: [[780, 111], [780, 140]], label: '2a. save user', labelAt: [780, 111], labelFs: 17 });
  s.arrow('api', 'outbox', { fromSide: 'r', toSide: 'l', t0: 0.7, t1: 0.5, via: [[760, 138], [760, 290]], label: '2b. save message\nto the outbox', labelAt: [760, 214], labelFs: 17 });
  s.arrow('outbox', 'worker', { fromSide: 'l', toSide: 'r', t0: 0.9, t1: 0.5, label: '3. polls the outbox', labelAt: [780, 330], labelFs: 17 });
  s.arrow('worker', 'bus', { label: '4. publishes the message', labelAt: [460, 450], labelFs: 17 });
  return { skeleton: s.elements() };
};
