import { scene } from '../../scripts/excalidraw/dsl.mjs';
// The four "types" of CQRS: from no separation to separate storage.
export default () => {
  const s = scene();
  const panel = (id, x, y, n, title, fill, stroke) => { s.frame(id, x, y, 600, 380, `Type ${n}: ${title}`, { fill, stroke, solid: true, fs: 24 }); };
  // 0
  panel('p0', 0, 0, 0, 'no CQRS', 'pGray', '#868e96');
  s.box('m0', 170, 80, 260, 90, 'One model\ncommands + queries', { fill: 'gray' });
  s.db('d0', 205, 240, 190, 100, 'One database', { fill: 'yellow', fs: 18 });
  s.arrow('m0', 'd0', { both: true });
  // 1
  panel('p1', 640, 0, 1, 'separated classes', 'pGreen', '#2f9e44');
  s.box('w1', 690, 80, 220, 90, 'Domain model\n(commands)', { fill: 'orange' });
  s.box('r1', 960, 80, 220, 90, 'DTOs\n(queries)', { fill: 'blue' });
  s.db('d1', 830, 240, 190, 100, 'One database', { fill: 'yellow', fs: 18 });
  s.arrow('w1', 'd1', { fromSide: 'b', toSide: 't', t1: 0.3 }); s.arrow('r1', 'd1', { fromSide: 'b', toSide: 't', t1: 0.7 });
  // 2
  panel('p2', 0, 420, 2, 'separated model and API', 'pBlue', '#1c7ed6');
  s.box('w2', 30, 500, 240, 90, 'Command API\ndomain model', { fill: 'orange' });
  s.box('r2', 330, 500, 240, 90, 'Query API\nquery handlers', { fill: 'blue' });
  s.db('d2', 200, 660, 190, 100, 'One database', { fill: 'yellow', fs: 18 });
  s.arrow('w2', 'd2', { fromSide: 'b', toSide: 't', t1: 0.3 }); s.arrow('r2', 'd2', { fromSide: 'b', toSide: 't', t1: 0.7 });
  // 3
  panel('p3', 640, 420, 3, 'separated storage', 'pOrange', '#e8590c');
  s.box('w3', 670, 500, 220, 90, 'Command side', { fill: 'orange' });
  s.box('r3', 1000, 500, 220, 90, 'Query side', { fill: 'blue' });
  s.db('wd', 665, 660, 170, 100, 'Write DB', { fill: 'yellow', fs: 18 });
  s.db('rd', 1045, 660, 170, 100, 'Read DB', { fill: 'green', fs: 18 });
  s.arrow('w3', 'wd', { fromSide: 'b', toSide: 't' }); s.arrow('r3', 'rd', { fromSide: 'b', toSide: 't' });
  s.arrow('wd', 'rd', { fromSide: 'r', toSide: 'l', dashed: true, color: '#e8590c', label: 'events, in the\nbackground', labelAt: [940, 785], labelFs: 15 });
  return { skeleton: s.elements(), scale: 1.6 };
};
