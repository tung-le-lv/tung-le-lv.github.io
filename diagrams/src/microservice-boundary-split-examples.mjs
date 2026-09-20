import { scene } from '../../scripts/excalidraw/dsl.mjs';
// One worked example for each of the six classic granularity drivers, numbered to match the cards.
export default () => {
  const s = scene();
  const R = '#e03131', G = '#2f9e44';
  const panel = (id, n, col, row, title, fill, stroke) => {
    const x = col * 560, y = row * 560;
    s.frame(id, x, y, 520, 520, `${n}. ${title}`, { fill, stroke, solid: true, fs: 24 });
    return { x, y };
  };
  const parent = (id, x, y, label, h = 100) => s.box(id, x + 110, y + 70, 300, h, label, { fill: 'white', fs: 18 });
  const child = (id, px, x, y, w, label, fill, opts = {}) => { s.box(id, x, y + 300, w, 110, label, { fill, fs: 17, ...opts }); s.arrow(px, id, { fromSide: 'b', toSide: 't', t0: 0.5 }); };
  const caption = (x, y, w, text, color) => s.text(x, y + 430, text, { fs: 17, color });

  // 1. scope and function
  let { x, y } = panel('p1', 1, 0, 0, 'Scope and function', 'pBlue', '#1c7ed6');
  parent('n1', x, y, 'Customer service\nProfile · Preferences · Comments');
  [['Profile\nservice', 25], ['Preferences\nservice', 190], ['Comments\nservice', 355]].forEach(([l, dx], i) => { child(`c1${i}`, 'n1', x + dx, y, 140, l, 'blue'); caption(x + dx + 4, y, 140, 'single purpose', G); });

  // 2. code volatility
  ({ x, y } = panel('p2', 2, 1, 0, 'Code volatility', 'pOrange', '#e8590c'));
  parent('n2', x, y, 'Notification service\nSMS · Email · Postal letter');
  child('a2', 'n2', x + 30, y, 220, 'Electronic\nnotifications\n(SMS, Email)', 'green'); child('b2', 'n2', x + 285, y, 205, 'Letter\nnotifications\n(Postal letter)', 'orange');
  caption(x + 40, y, 0, 'code rarely changes'); caption(x + 290, y, 0, 'code changes often', R);

  // 3. scalability
  ({ x, y } = panel('p3', 3, 2, 0, 'Scalability and throughput', 'pGreen', '#2f9e44'));
  parent('n3', x, y, 'Notification service');
  [['SMS\nservice', '220,000 / min', 25], ['Email\nservice', '500 / min', 190], ['Letter\nservice', '1 / min', 355]].forEach(([l, rate, dx], i) => { child(`c3${i}`, 'n3', x + dx, y, 140, l, 'green'); caption(x + dx, y, 140, rate, R); });

  // 4. fault tolerance
  ({ x, y } = panel('p4', 4, 0, 1, 'Fault tolerance', 'pRed', '#e03131'));
  parent('n4', x, y, 'Notification service\nSMS · Email · Postal letter');
  [['SMS\nservice', 'rarely fails', 25, 'green', G], ['Letter\nservice', 'rarely fails', 190, 'green', G], ['Email\nservice', 'always fails', 355, 'red', R]].forEach(([l, cap, dx, fill, col], i) => { child(`c4${i}`, 'n4', x + dx, y, 140, l, fill); caption(x + dx + 4, y, 140, cap, col); });
  s.text(x + 60, y + 475, 'one failing path no longer drags the rest down', { fs: 16, color: R });

  // 5. security
  ({ x, y } = panel('p5', 5, 1, 1, 'Security', 'pPurple', '#7048e8'));
  parent('n5', x, y, 'Profile service\nprofile info +\ncredit card info', 110);
  child('pr', 'n5', x + 30, y, 200, 'Profile\nservice', 'blue'); child('wa', 'n5', x + 290, y, 200, 'Wallet\nservice', 'purple');
  caption(x + 30, y, 0, 'low security needs'); caption(x + 290, y, 0, 'high security needs', R);

  // 6. extensibility
  ({ x, y } = panel('p6', 6, 2, 1, 'Extensibility', 'pYellow', '#f08c00'));
  parent('n6', x, y, 'Payment service\nCredit card · Gift card · PayPal');
  [['Credit\ncard', 15], ['Gift\ncard', 145], ['PayPal', 275]].forEach(([l, dx], i) => child(`c6${i}`, 'n6', x + dx, y, 115, l, 'yellow'));
  child('c63', 'n6', x + 405, y, 105, 'Next\nmethod', 'white', { dashed: true });
  caption(x + 60, y, 0, 'a new method = a new small service', '#495057');

  return { skeleton: s.elements(), scale: 1.6 };
};
