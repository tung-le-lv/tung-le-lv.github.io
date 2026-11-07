import { scene } from '../../scripts/excalidraw/dsl.mjs';
// Global vs local identity. The engine sits outside the car only because this business tracks engines on their own.
export default () => {
  const s = scene();
  const B = '#1971c2';

  s.frame('car', 0, 0, 720, 460, 'Car Aggregate', { fill: 'pYellow', stroke: '#f08c00', sw: 3 });
  s.box('root', 30, 60, 660, 100, 'Car (root)\nglobal identity: VIN', { fill: 'yellow' });
  [['t1', 30, 'front left', 0.114], ['t2', 200, 'front right', 0.371], ['t3', 370, 'rear left', 0.629], ['t4', 540, 'rear right', 0.886]].forEach(([id, x, pos, t0]) => {
    s.box(id, x, 250, 150, 90, `Tire\n${pos}`, { fill: 'blue', fs: 18 });
    s.arrow('root', id, { fromSide: 'b', toSide: 't', t0 });
  });
  s.text(30, 362, 'Local identity: "front left" only means something inside this car.\nNobody looks up a tire on its own, so there is no TireRepository.', { fs: 18 });

  s.frame('eng', 1010, 0, 400, 460, 'Engine Aggregate', { fill: 'pPurple', stroke: '#7048e8', sw: 3 });
  s.box('engine', 1040, 60, 340, 100, 'Engine (root)\nglobal identity: serial number', { fill: 'purple', fs: 18 });
  s.text(1040, 200, 'Its own root only because this\nbusiness tracks engines across\nseveral cars.\n\nWhere nobody does that, an engine\ncan stay inside the Car.', { fs: 18 });

  s.arrow('root', 'engine', { fromSide: 'r', toSide: 'l', dashed: true, color: B, label: 'serial number only', labelFs: 18 });

  return { skeleton: s.elements() };
};
