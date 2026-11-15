import { scene } from '../../scripts/excalidraw/dsl.mjs';
// Why values are immutable: a shared mutable Address moves two customers; replacing the value moves one.
export default () => {
  const s = scene();
  const G = '#2f9e44', R = '#e03131';

  s.frame('mut', 0, 0, 700, 520, 'Mutable Address, shared', { fill: 'pRed', stroke: R, solid: true, fs: 22 });
  s.box('a1', 40, 80, 240, 80, 'Customer A', { fill: 'yellow', fs: 18 });
  s.box('b1', 420, 80, 240, 80, 'Customer B', { fill: 'yellow', fs: 18 });
  s.box('addr1', 180, 290, 340, 90, 'Address\nstreet: 9 Oak Avenue', { fill: 'red', fs: 18 });
  s.arrow('a1', 'addr1', { fromSide: 'b', toSide: 't', t1: 0.25 });
  s.arrow('b1', 'addr1', { fromSide: 'b', toSide: 't', t1: 0.75 });
  s.text(40, 410, 'A calls address.setStreet("9 Oak Avenue").\nB moved house too, and nothing in B changed.', { fs: 18, color: R });

  s.frame('imm', 760, 0, 700, 520, 'Immutable Address, replaced', { fill: 'pGreen', stroke: G, solid: true, fs: 22 });
  s.box('a2', 800, 80, 240, 80, 'Customer A', { fill: 'yellow', fs: 18 });
  s.box('b2', 1180, 80, 240, 80, 'Customer B', { fill: 'yellow', fs: 18 });
  s.box('new', 800, 290, 240, 90, 'Address\n9 Oak Avenue', { fill: 'green', fs: 18 });
  s.box('old', 1180, 290, 240, 90, 'Address\n12 Elm Street', { fill: 'white', fs: 18 });
  s.arrow('a2', 'new', { fromSide: 'b', toSide: 't', label: 'new object', labelFs: 18 });
  s.arrow('b2', 'old', { fromSide: 'b', toSide: 't' });
  s.text(800, 410, 'A gets a new Address. B keeps the old one,\nand nobody can change it under B\'s feet.', { fs: 18, color: G });

  return { skeleton: s.elements() };
};
