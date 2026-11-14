import { scene } from '../../scripts/excalidraw/dsl.mjs';
// One street address, three Bounded Contexts: a Value Object in one, an Entity in the other two.
export default () => {
  const s = scene();
  const G = '#2f9e44', O = '#e8590c';

  // 1. Mail-order shipping: the address is a Value Object.
  s.frame('mail', 0, 0, 470, 560, 'Mail-order shipping', { fill: 'pGreen', stroke: G, solid: true, fs: 22 });
  s.text(20, 48, 'Address is a Value Object', { fs: 18, color: G });
  s.box('c1', 20, 110, 200, 80, 'Customer A\n(Entity)', { fill: 'yellow', fs: 18 });
  s.box('c2', 250, 110, 200, 80, 'Customer B\n(Entity)', { fill: 'yellow', fs: 18 });
  s.box('a1', 20, 290, 200, 80, 'Address\n12 Elm Street', { fill: 'green', fs: 18 });
  s.box('a2', 250, 290, 200, 80, 'Address\n12 Elm Street', { fill: 'green', fs: 18 });
  s.arrow('c1', 'a1', { fromSide: 'b', toSide: 't' });
  s.arrow('c2', 'a2', { fromSide: 'b', toSide: 't' });
  s.text(20, 410, 'Two equal copies. The system only\nneeds text for a parcel label, so\nnobody asks which address it is.', { fs: 18 });

  // 2. Postal service: the address is an Entity in a hierarchy.
  s.frame('post', 510, 0, 470, 560, 'Postal service', { fill: 'pOrange', stroke: O, solid: true, fs: 22 });
  s.text(530, 48, 'Address is an Entity', { fs: 18, color: O });
  [['region', 100, 'Region'], ['zone', 190, 'Postal zone'], ['block', 280, 'Block'], ['addr', 370, 'Address\n12 Elm Street']].forEach(([id, y, label], i, all) => {
    s.box(id, 615, y, 260, id === 'addr' ? 80 : 60, label, { fill: id === 'addr' ? 'orange' : 'yellow', fs: 18 });
    if (i > 0) s.arrow(all[i - 1][0], id, { fromSide: 'b', toSide: 't' });
  });
  s.text(530, 475, 'Delivery routes are organised around\nit. Move a zone and every address\nunder it moves too.', { fs: 18 });

  // 3. Electric utility: the address is a service point that outlives its occupants.
  s.frame('util', 1020, 0, 470, 560, 'Electric utility', { fill: 'pOrange', stroke: O, solid: true, fs: 22 });
  s.text(1040, 48, 'Address is an Entity (or a Dwelling)', { fs: 18, color: O });
  s.box('dwell', 1090, 100, 330, 90, 'Dwelling\nservice point at 12 Elm Street', { fill: 'orange', fs: 18 });
  s.box('meter', 1040, 300, 190, 70, 'Meter', { fill: 'yellow', fs: 18 });
  s.box('occ', 1280, 300, 190, 70, 'Occupants\ncome and go', { fill: 'white', fs: 18, dashed: true });
  s.arrow('dwell', 'meter', { fromSide: 'b', toSide: 't', t0: 0.25 });
  s.arrow('dwell', 'occ', { fromSide: 'b', toSide: 't', t0: 0.75, dashed: true });
  s.text(1040, 410, 'Power lines and meters are tracked\nfor decades. Two roommates calling\nabout one supply is one service point.', { fs: 18 });

  return { skeleton: s.elements() };
};
