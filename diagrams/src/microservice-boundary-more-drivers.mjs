import { scene } from '../../scripts/excalidraw/dsl.mjs';
// Six more reasons to split a service, from practice (numbers continue from the six classic drivers).
export default () => {
  const s = scene();
  s.text(0, -10, 'Six more reasons from practice', { fs: 34 });
  const cards = [
    ['Team ownership', 'teal', 'Do two teams keep blocking\neach other in one service?', 'Checkout and Promotions teams\nboth editing one Cart service'],
    ['Release cadence', 'orange', 'Do parts need to ship at very\ndifferent speeds or risk levels?', 'Weekly-tested widgets vs an\naudited pricing engine'],
    ['Technology fit', 'blue', 'Does a part need a different\nlanguage, runtime or hardware?', 'GPU model inference next to\na Java order service'],
    ['Data characteristics', 'green', 'Do parts need different stores,\nretention or consistency?', 'Search-index catalogue vs\nstrongly consistent inventory'],
    ['Compliance, residency', 'red', 'Is a part under stricter rules\nor tied to a region?', 'Card handling isolated to\nshrink the audit scope'],
    ['Workload profile', 'purple', 'Do batch jobs share a service\nwith latency-sensitive calls?', 'Nightly report generation vs\nthe interactive API'],
  ];
  cards.forEach(([title, fill, q, ex], i) => {
    const x = (i % 3) * 440, y = 50 + Math.floor(i / 3) * 300;
    s.box(`c${i}`, x, y, 400, 260, '', { fill });
    s.badge(x + 14, y + 12, i + 7, { d: 54, fs: 20 });
    s.text(x + 80, y + 24, title, { fs: 25 });
    s.text(x + 24, y + 84, q, { fs: 20 });
    s.text(x + 24, y + 170, `e.g. ${ex}`, { fs: 18, color: '#495057' });
  });
  return { skeleton: s.elements(), scale: 2 };
};
