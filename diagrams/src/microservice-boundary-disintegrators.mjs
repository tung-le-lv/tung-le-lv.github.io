import { scene } from '../../scripts/excalidraw/dsl.mjs';
// The six granularity disintegrators: measurable reasons to split a service.
export default () => {
  const s = scene();
  s.text(0, -10, 'Six measurable reasons to split a service', { fs: 34 });
  const cards = [
    ['Scope and function', 'blue', 'Does the service do several\nunrelated things?', 'Customer service split into\nProfile, Preferences, Comments'],
    ['Code volatility', 'orange', 'Does one part change much\nmore often than the rest?', 'Postal-letter code changes often;\nSMS and email rarely'],
    ['Scalability, throughput', 'green', 'Do the parts need very\ndifferent capacity?', 'SMS 220,000/min, email 500/min,\nletters 1/min'],
    ['Fault tolerance', 'red', 'Does one part fail often\nand hurt the rest?', 'A flaky email path should not\ntake SMS and letters down'],
    ['Security', 'purple', 'Do the parts have different\nsecurity needs?', 'Profile info (low security) vs\ncredit card info (high)'],
    ['Extensibility', 'yellow', 'Will you keep adding new\nvariants of the same thing?', 'Payment methods: credit card,\ngift card, PayPal, the next one'],
  ];
  cards.forEach(([title, fill, q, ex], i) => {
    const x = (i % 3) * 440, y = 50 + Math.floor(i / 3) * 300;
    s.box(`c${i}`, x, y, 400, 260, '', { fill, round: true });
    s.badge(x + 16, y + 16, i + 1, { d: 38, fs: 20 });
    s.text(x + 68, y + 20, title, { fs: 26 });
    s.text(x + 24, y + 84, q, { fs: 20 });
    s.text(x + 24, y + 170, `e.g. ${ex}`, { fs: 18, color: '#495057' });
  });
  return { skeleton: s.elements(), scale: 2 };
};
