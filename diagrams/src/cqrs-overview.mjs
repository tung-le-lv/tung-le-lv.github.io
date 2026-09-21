import { scene } from '../../scripts/excalidraw/dsl.mjs';
// CQRS: separate command side and query side, kept in sync by events.
export default () => {
  const s = scene();
  s.box('cl', 0, 250, 170, 100, 'Client', { fill: 'gray' });
  s.frame('cmd', 330, 0, 620, 260, 'Command side (writes)', { fill: 'pOrange', stroke: '#e8590c', solid: true, fs: 24 });
  s.box('ch', 370, 70, 240, 90, 'Command handlers\nbusiness rules', { fill: 'orange' });
  s.db('wdb', 690, 60, 210, 110, 'Write database\nnormalised', { fill: 'yellow', fs: 17 });
  s.frame('qry', 330, 340, 620, 260, 'Query side (reads)', { fill: 'pBlue', stroke: '#1c7ed6', solid: true, fs: 24 });
  s.box('qh', 370, 410, 240, 90, 'Query handlers\nno business rules', { fill: 'blue' });
  s.db('rdb', 690, 400, 210, 110, 'Read database\ndenormalised view', { fill: 'green', fs: 17 });
  s.box('ev', 1080, 240, 200, 120, 'Events\nOrderPlaced ...', { fill: 'purple', fs: 19 });
  s.arrow('cl', 'ch', { fromSide: 'r', toSide: 'l', via: [[250, 300], [250, 115]], label: 'commands\n(create, update, delete)', labelAt: [250, 200], labelFs: 16 });
  s.arrow('cl', 'qh', { fromSide: 'r', toSide: 'l', t0: 0.7, via: [[250, 320], [250, 455]], label: 'queries\n(read only)', labelAt: [250, 400], labelFs: 16 });
  s.arrow('ch', 'wdb', { both: true });
  s.arrow('qh', 'rdb', { both: true });
  s.arrow('wdb', 'ev', { fromSide: 'r', toSide: 't', t1: 0.3, via: [[1000, 115], [1140, 115]], label: 'publishes', labelAt: [1010, 85], labelFs: 16 });
  s.arrow('ev', 'rdb', { fromSide: 'b', toSide: 'r', t0: 0.3, via: [[1140, 455]], dashed: true, label: 'updates the view\n(asynchronously)', labelAt: [1040, 430], labelFs: 16 });
  return { skeleton: s.elements(), scale: 1.8 };
};
