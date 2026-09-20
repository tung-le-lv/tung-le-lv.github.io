import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  const cols = [
    { id: 'm', cx: 170, team: 'Mobile client team', client: 'Mobile client', gw: 'Mobile API gateway', api: 'Mobile API', fill: 'blue' },
    { id: 'b', cx: 540, team: 'Browser client team', client: 'Browser JavaScript\napplication', gw: 'Browser API gateway', api: 'Browser API', fill: 'green' },
    { id: 'p', cx: 910, team: 'Public API team', client: '3rd-party\napplication', gw: 'Public API gateway', api: 'Public API', fill: 'yellow' },
  ];
  for (const c of cols) {
    s.box(`team-${c.id}`, c.cx - 130, 0, 260, 80, `${c.team}\nowns client + gateway`, { fill: 'pGray', dashed: true, fs: 18 });
    s.box(`client-${c.id}`, c.cx - 130, 170, 260, 90, c.client, { fill: c.fill });
    s.frame(`gw-${c.id}`, c.cx - 160, 350, 320, 250, c.gw, { fill: 'pGreen', stroke: '#2f9e44' });
    s.box(`api-${c.id}`, c.cx - 130, 430, 260, 100, c.api, { fill: 'white' });
    s.arrow(`team-${c.id}`, `client-${c.id}`, { label: 'owns', labelFs: 16, labelDx: 34 });
    s.arrow(`client-${c.id}`, `api-${c.id}`, { fromSide: 'b', toSide: 't', t0: 0.85, t1: 0.85 });
  }
  s.box('common', 10, 690, 1060, 90, 'Common layer  (owned by the API gateway team)', { fill: 'orange' });
  for (const c of cols) s.arrow(`api-${c.id}`, 'common', { fromSide: 'b', toSide: 't', t0: 0.85, t1: (c.cx - 130 + 0.85 * 260 - 10) / 1060 });
  return { skeleton: s.elements() };
};
