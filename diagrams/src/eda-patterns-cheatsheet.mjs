import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  const panel = (id, n, x, y, w, h, title, fill, stroke) => {
    s.frame(id, x, y, w, h, title, { fill, stroke, tx: 58, ty: 14, fs: 24, solid: true, sw: 2.5 });
    s.badge(x + 14, y + 12, n, { d: 36, fs: 20 });
  };
  const F = 17; // panel content font

  // ---- 1. Competing consumer
  panel('p1', 1, 0, 0, 900, 430, 'Competing consumer', 'pPurple', '#7048e8');
  ['1', '2', '3'].forEach((n, i) => s.box(`prod${n}`, 30, 95 + i * 90, 160, 60, `Producer ${n}`, { fill: 'blue', fs: F }));
  s.box('q1', 330, 170, 200, 90, 'Message queue', { fill: 'orange', fs: F });
  s.frame('cons', 640, 80, 230, 270, 'Competing consumers', { fill: 'pGreen', stroke: '#2f9e44', fs: 16 });
  ['A', 'B', 'C'].forEach((n, i) => s.box(`c${n}`, 665, 125 + i * 72, 180, 55, `Consumer ${n}`, { fill: 'green', fs: F }));
  ['1', '2', '3'].forEach((n) => s.arrow(`prod${n}`, 'q1'));
  ['A', 'B', 'C'].forEach((n) => s.arrow('q1', `c${n}`));
  s.note('n1', 30, 360, 560, 54, 'Each message goes to exactly one consumer, so load is balanced.', { fs: 16 });

  // ---- 2. Consume and project
  panel('p2', 2, 940, 0, 960, 430, 'Consume and project', 'pRed', '#e03131');
  s.box('os', 975, 190, 160, 80, 'Order\nservice', { fill: 'blue', fs: F });
  s.box('q2', 1235, 190, 160, 80, 'Message\nqueue', { fill: 'orange', fs: F });
  s.box('proj', 1500, 190, 200, 80, 'Order projection\nservice', { fill: 'purple', fs: F });
  s.box('cust', 1500, 70, 200, 70, 'Customer\nservice', { fill: 'teal', fs: F });
  s.db('cdb', 1770, 55, 100, 95, 'Customer\nDB', { fill: 'yellow', fs: 14, ry: 12 });
  s.db('view', 1500, 320, 200, 95, 'Customer-order\nmaterialized view', { fill: 'green', fs: 15, ry: 12 });
  s.arrow('os', 'q2', { label: 'OrderCreated', labelFs: 15 });
  s.arrow('q2', 'proj', { label: 'OrderCreated', labelFs: 15 });
  s.arrow('proj', 'cust', { fromSide: 't', toSide: 'b', label: 'enrich', labelFs: 15, labelDx: 34 });
  s.arrow('cust', 'cdb', { both: true });
  s.arrow('proj', 'view', { fromSide: 'b', toSide: 't', label: 'writes', labelFs: 15, labelDx: 34 });

  // ---- 3. Event sourcing
  panel('p3', 3, 0, 470, 610, 440, 'Event sourcing', 'pOrange', '#e8590c');
  ['OrderCreated', 'OrderShipped', 'OrderCancelled'].forEach((n, i) => s.box(`ev${i}`, 175 + i * 143, 540, 133, 56, n, { fill: 'yellow', fs: 15 }));
  s.box('cl3', 30, 660, 110, 70, 'Client', { fill: 'gray', fs: F });
  s.db('store', 380, 650, 190, 95, 'Event store', { fill: 'yellow', fs: F });
  s.db('read', 380, 815, 190, 85, 'Read database', { fill: 'green', fs: F });
  s.arrow('cl3', 'ev0', { fromSide: 't', toSide: 'l', via: [[85, 568]], label: 'append', labelAt: [85, 600], labelFs: 15 });
  s.arrow('ev1', 'store', { fromSide: 'b', toSide: 't', t0: 0.5, t1: 0.5, via: [[384, 630], [475, 630]] , head: true });
  s.arrow('store', 'read', { dashed: true, label: 'projected\nasync', labelAt: [475, 780], labelFs: 15 });
  s.arrow('cl3', 'read', { fromSide: 'b', toSide: 'l', via: [[85, 858]], label: 'queries', labelAt: [230, 858], labelFs: 15 });
  s.text(105, 752, 'state = replay of\nall the events', { fs: 15, color: '#e8590c' });

  // ---- 4. Async task execution
  panel('p4', 4, 650, 470, 610, 440, 'Async task execution', 'pBlue', '#1c7ed6');
  s.box('cl4', 680, 660, 110, 70, 'Client', { fill: 'gray', fs: F });
  s.box('dq', 850, 570, 190, 90, 'Default queue\nT1  T2  T3', { fill: 'orange', fs: F });
  s.box('uq', 850, 740, 190, 90, 'Urgent queue\nT4  T5  T6', { fill: 'red', fs: F });
  s.frame('wk', 1100, 545, 140, 310, 'Workers', { fill: 'pGreen', stroke: '#2f9e44', fs: 16, tx: 34 });
  ['1', '2', '3'].forEach((n, i) => s.box(`w${n}`, 1112, 595 + i * 80, 116, 55, `Worker ${n}`, { fill: 'green', fs: 15 }));
  s.arrow('cl4', 'dq'); s.arrow('cl4', 'uq');
  s.arrow('dq', 'wk', { fromSide: 'r', toSide: 'l', t1: 0.3 }); s.arrow('uq', 'wk', { fromSide: 'r', toSide: 'l', t1: 0.7 });

  // ---- 5. Transactional outbox
  panel('p5', 5, 1300, 470, 600, 440, 'Transactional outbox', 'pYellow', '#f08c00');
  s.box('os5', 1330, 540, 150, 60, 'Order service', { fill: 'green', fs: F });
  s.frame('db5', 1330, 640, 270, 200, 'Database', { fill: 'pPurple', stroke: '#7048e8', fs: 16, ty: 165 });
  s.box('ot', 1340, 690, 120, 65, 'Order\ntable', { fill: 'blue', fs: 16 });
  s.box('obt', 1470, 690, 120, 65, 'Outbox\ntable', { fill: 'orange', fs: 16 });
  s.box('rel', 1650, 690, 105, 65, 'Message\nrelay', { fill: 'purple', fs: 16 });
  s.box('brk', 1800, 690, 90, 65, 'Message\nbroker', { fill: 'yellow', fs: 15 });
  s.box('dst', 1765, 800, 125, 60, 'Destination\nsystem', { fill: 'gray', fs: 15 });
  s.arrow('os5', 'ot', { fromSide: 'b', toSide: 't', t0: 0.3, label: 'one transaction', labelAt: [1440, 625], labelFs: 15 });
  s.arrow('os5', 'obt', { fromSide: 'b', toSide: 't', t0: 0.75 });
  s.arrow('rel', 'obt', { fromSide: 'l', toSide: 'r', label: 'reads', labelAt: [1627, 668], labelFs: 15 });
  s.arrow('rel', 'brk', { label: 'publishes', labelAt: [1778, 668], labelFs: 14 });
  s.arrow('brk', 'dst', { fromSide: 'b', toSide: 't', dashed: true });

  // ---- 6. Event aggregation
  panel('p6', 6, 0, 950, 900, 400, 'Event aggregation', 'pGreen', '#2f9e44');
  s.box('prod6', 30, 1110, 150, 75, 'Event\nproducer', { fill: 'green', fs: F });
  s.frame('agg', 250, 1045, 360, 220, 'Event aggregator service', { fill: 'pPurple', stroke: '#7048e8', fs: 16 });
  ['Contact', 'Account', 'Address'].forEach((n, i) => s.box(`ag${i}`, 268 + i * 112, 1115, 100, 75, `${n}\nevent`, { fill: ['blue', 'teal', 'yellow'][i], fs: 15 }));
  s.box('agg-out', 670, 1090, 205, 75, 'Create customer\n(coarse-grained event)', { fill: 'orange', fs: 15 });
  s.box('cons6', 670, 1215, 205, 70, 'Create customer\nconsumer service', { fill: 'purple', fs: 15 });
  s.arrow('prod6', 'agg', { label: 'fine-grained\nevents', labelAt: [215, 1120], labelFs: 15 });
  s.arrow('agg', 'agg-out', { fromSide: 'r', toSide: 'l', t0: 0.45, t1: 0.5 });
  s.arrow('agg-out', 'cons6', { fromSide: 'b', toSide: 't' });
  s.note('n6', 30, 1285, 560, 50, 'Create customer = create contact + create account + create address', { fs: 15 });

  // ---- 7. Saga
  panel('p7', 7, 940, 950, 960, 400, 'Saga', 'pPurple', '#7048e8');
  s.box('os7', 975, 1150, 150, 70, 'Order\nservice', { fill: 'green', fs: F });
  s.db('odb', 985, 1255, 130, 80, 'Orders', { fill: 'yellow', fs: 16, ry: 11 });
  s.box('orch', 1310, 1140, 220, 95, 'Order saga\norchestrator', { fill: 'teal', fs: F });
  s.box('pay', 1730, 1030, 150, 65, 'Payment\nservice', { fill: 'orange', fs: 16 });
  s.box('shp', 1730, 1250, 150, 65, 'Shipping\nservice', { fill: 'orange', fs: 16 });
  s.arrow('os7', 'orch', { label: '1. create order', labelAt: [1220, 1170], labelFs: 15 });
  // payment: command along the top lane, reply along a lower lane
  s.arrow('orch', 'pay', { fromSide: 't', toSide: 'l', t0: 0.2, via: [[1354, 1032]], label: '2. process payment (command)', labelAt: [1540, 1032], labelFs: 15 });
  s.arrow('pay', 'orch', { fromSide: 'b', toSide: 't', t0: 0.3, t1: 0.8, dashed: true, via: [[1775, 1090], [1486, 1090]], label: '3. payment completed', labelAt: [1630, 1090], labelFs: 15 });
  // shipping: command along the bottom lane, reply back up along a higher lane
  s.arrow('orch', 'shp', { fromSide: 'b', toSide: 'l', t0: 0.8, via: [[1486, 1282]], label: '4. initiate shipping (command)', labelAt: [1610, 1282], labelFs: 15 });
  s.arrow('shp', 'orch', { fromSide: 't', toSide: 'r', t0: 0.3, t1: 0.7, dashed: true, via: [[1775, 1206]], label: '5. order shipped', labelAt: [1655, 1206], labelFs: 15 });
  s.arrow('orch', 'odb', { fromSide: 'b', toSide: 'r', t0: 0.2, via: [[1354, 1295]], label: '6. update order status', labelAt: [1245, 1295], labelFs: 15 });
  return { skeleton: s.elements(), scale: 1.5 };
};
