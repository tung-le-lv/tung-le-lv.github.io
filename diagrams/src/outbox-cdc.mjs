import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  s.db('src', 130, 80, 260, 150, 'Source database', { fill: 'blue' });
  s.text(-230, 130, 'INSERT\nUPDATE\nDELETE', { fs: 18 });
  s.line([[-40, 155], [120, 155]]);
  s.box('logs', 130, 350, 260, 100, 'Transaction log', { fill: 'gray' });
  s.arrow('src', 'logs', { label: 'every commit\nis written', labelAt: [260, 290], labelFs: 16 });
  s.box('cdc', 560, 235, 300, 120, 'Change data capture\n(CDC tool)', { fill: 'purple' });
  s.arrow('logs', 'cdc', { fromSide: 'r', toSide: 'l', via: [[470, 400], [470, 295]], label: 'reads the log', labelAt: [470, 350], labelFs: 16 });
  s.db('tgt', 1050, 30, 260, 150, 'Target database', { fill: 'green' });
  s.box('kafka', 1050, 330, 260, 110, 'Kafka topic', { fill: 'yellow' });
  s.arrow('cdc', 'tgt', { fromSide: 'r', toSide: 'l', via: [[950, 295], [950, 105]], label: 'changes', labelAt: [950, 190], labelFs: 16 });
  s.arrow('cdc', 'kafka', { fromSide: 'r', toSide: 'l', via: [[950, 295], [950, 385]], label: 'events', labelAt: [950, 350], labelFs: 16 });
  return { skeleton: s.elements() };
};
