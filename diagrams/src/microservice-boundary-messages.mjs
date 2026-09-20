import { scene } from '../../scripts/excalidraw/dsl.mjs';
// What may cross a bounded-context boundary, and what must stay inside.
export default () => {
  const s = scene();
  s.text(120, 0, 'Across a boundary: events only', { fs: 30, color: '#e8590c' });
  s.frame('bc1', 0, 90, 320, 240, 'Sales bounded context', { fill: 'pGreen', stroke: '#2f9e44' });
  s.box('sales', 60, 170, 200, 100, 'Sales', { fill: 'green' });
  s.frame('bc2', 520, 90, 700, 240, 'Shipping bounded context', { fill: 'pRed', stroke: '#e03131' });
  s.box('shipA', 570, 170, 200, 100, 'Shipping\ncomponent A', { fill: 'red' });
  s.box('shipB', 990, 170, 200, 100, 'Shipping\ncomponent B', { fill: 'red' });
  s.arrow('sales', 'shipA', { color: '#e8590c', sw: 4, label: 'event', labelAt: [420, 220], labelFs: 20 });
  s.arrow('shipA', 'shipB', { both: true, color: '#1c7ed6', sw: 3, label: 'command / event', labelAt: [880, 220], labelFs: 15 });
  s.text(600, 360, 'Inside a boundary: commands and events', { fs: 30, color: '#1c7ed6' });
  s.note('n1', 0, 430, 480, 90, 'Events are facts. They carry no address and are\nnot designed for any one consumer.', { fs: 17 });
  s.note('n2', 740, 430, 480, 90, 'Commands ask for work. They stay inside the\nservice that owns the behaviour.', { fs: 17, fill: 'pBlue', stroke: '#1c7ed6' });
  return { skeleton: s.elements(), scale: 2 };
};
