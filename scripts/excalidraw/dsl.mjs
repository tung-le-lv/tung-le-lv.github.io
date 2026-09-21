// Tiny layout helper that emits Excalidraw "element skeletons" (converted by the exporter).
// All coordinates are absolute canvas pixels.
export const COLORS = {
  blue: '#a5d8ff', green: '#b2f2bb', yellow: '#ffec99', red: '#ffc9c9', purple: '#d0bfff',
  orange: '#ffd8a8', gray: '#e9ecef', teal: '#96f2d7', white: '#ffffff', none: 'transparent',
  // soft panel tints
  pBlue: '#e7f5ff', pGreen: '#ebfbee', pYellow: '#fff9db', pRed: '#fff5f5', pPurple: '#f3f0ff', pOrange: '#fff4e6', pGray: '#f8f9fa',
};
const ink = '#1e1e1e';
const col = (c) => COLORS[c] ?? c ?? 'transparent';

export function scene({ fs = 20 } = {}) {
  const back = [];   // frames / panels (drawn first)
  const mid = [];    // shapes
  const arrows = []; // connectors
  const front = [];  // labels, badges, notes (drawn last)
  const boxes = new Map();

  const api = {
    // Rounded rectangle with a centred label.
    box(id, x, y, w, h, label, o = {}) {
      boxes.set(id, { x, y, w, h });
      mid.push({
        type: o.shape ?? 'rectangle', id, x, y, width: w, height: h,
        backgroundColor: col(o.fill ?? 'white'), fillStyle: 'solid', roughness: o.rough ?? 1,
        strokeColor: o.stroke ?? ink, strokeStyle: o.dashed ? 'dashed' : 'solid', strokeWidth: o.sw ?? 2,
        roundness: o.round === false ? null : { type: 3 },
        ...(label ? { label: { text: label, fontSize: o.fs ?? fs, textAlign: 'center', verticalAlign: 'middle', strokeColor: o.tc ?? ink } } : {}),
      });
      return id;
    },
    // Dashed container with a title in its top-left corner; arrows may target it by id.
    frame(id, x, y, w, h, title, o = {}) {
      boxes.set(id, { x, y, w, h });
      back.push({
        type: 'rectangle', id, x, y, width: w, height: h, backgroundColor: col(o.fill ?? 'pGray'), fillStyle: 'solid',
        roughness: 1, strokeColor: o.stroke ?? '#868e96', strokeStyle: o.solid ? 'solid' : 'dashed', strokeWidth: o.sw ?? 2, roundness: { type: 3 },
      });
      if (title) front.push({ type: 'text', x: x + (o.tx ?? 16), y: y + (o.ty ?? 10), text: title, fontSize: o.fs ?? fs, strokeColor: o.tc ?? '#343a40' });
      return id;
    },
    // Database cylinder.
    db(id, x, y, w, h, label, o = {}) {
      boxes.set(id, { x, y, w, h });
      const ry = o.ry ?? 14, f = col(o.fill ?? 'blue');
      const common = { backgroundColor: f, fillStyle: 'solid', roughness: 1, strokeColor: ink, strokeWidth: o.sw ?? 2 };
      mid.push({ type: 'ellipse', x, y: y + h - 2 * ry, width: w, height: 2 * ry, ...common });
      mid.push({ type: 'rectangle', x, y: y + ry, width: w, height: h - 2 * ry, ...common, strokeColor: 'transparent', roundness: null,
        ...(label ? { label: { text: label, fontSize: o.fs ?? fs, textAlign: 'center', verticalAlign: 'middle', strokeColor: ink } } : {}) });
      mid.push({ type: 'line', x, y: y + ry, width: 0, height: h - 2 * ry, points: [[0, 0], [0, h - 2 * ry]], strokeColor: ink, strokeWidth: o.sw ?? 2, roughness: 1 });
      mid.push({ type: 'line', x: x + w, y: y + ry, width: 0, height: h - 2 * ry, points: [[0, 0], [0, h - 2 * ry]], strokeColor: ink, strokeWidth: o.sw ?? 2, roughness: 1 });
      mid.push({ type: 'ellipse', x, y, width: w, height: 2 * ry, ...common });
      return id;
    },
    text(x, y, str, o = {}) {
      front.push({ type: 'text', x, y, text: str, fontSize: o.fs ?? fs, strokeColor: o.color ?? ink, textAlign: o.align ?? 'left' });
    },
    // Sticky note (yellow) for callouts.
    note(id, x, y, w, h, str, o = {}) {
      boxes.set(id, { x, y, w, h });
      front.push({ type: 'rectangle', id, x, y, width: w, height: h, backgroundColor: col(o.fill ?? 'pYellow'), fillStyle: 'solid', roughness: 1,
        strokeColor: o.stroke ?? '#f59f00', strokeWidth: 1.5, roundness: { type: 3 },
        label: { text: str, fontSize: o.fs ?? fs - 2, textAlign: 'center', verticalAlign: 'middle' } });
    },
    // Numbered dark circle.
    badge(x, y, n, o = {}) {
      const d = o.d ?? 34;
      front.push({ type: 'ellipse', x, y, width: d, height: d, backgroundColor: o.fill ?? ink, fillStyle: 'solid', strokeColor: o.fill ?? ink, roughness: 0.6,
        label: { text: String(n), fontSize: o.fs ?? fs - 2, strokeColor: '#ffffff', textAlign: 'center', verticalAlign: 'middle' } });
    },
    // White-backed label sitting on a connector.
    tag(cx, cy, str, o = {}) {
      const size = o.fs ?? fs - 2;
      const lines = String(str).split('\n');
      const w = Math.max(...lines.map((l) => l.length)) * size * 0.62 + 28, h = lines.length * size * 1.3 + 10;
      front.push({ type: 'rectangle', x: cx - w / 2, y: cy - h / 2, width: w, height: h, backgroundColor: col(o.fill ?? '#ffffff'), fillStyle: 'solid',
        strokeColor: 'transparent', roughness: 0, roundness: { type: 3 }, label: { text: str, fontSize: size, textAlign: 'center', verticalAlign: 'middle', strokeColor: o.color ?? ink } });
    },
    anchor(id, side, t = 0.5, gap = 5) {
      const b = boxes.get(id);
      if (!b) throw new Error(`unknown box ${id}`);
      if (side === 'r') return [b.x + b.w + gap, b.y + b.h * t];
      if (side === 'l') return [b.x - gap, b.y + b.h * t];
      if (side === 't') return [b.x + b.w * t, b.y - gap];
      return [b.x + b.w * t, b.y + b.h + gap];
    },
    // Connector. o: fromSide/toSide ('l','r','t','b'), t0/t1 (0..1 along the edge), via [[x,y],...], dashed, color, sw, both, head:false,
    // label: text placed on the arrow (native Excalidraw arrow label; labelFs sets the size). labelAt/labelDx/labelDy are ignored.
    arrow(from, to, o = {}) {
      const a = boxes.get(from), z = boxes.get(to);
      const dx = z.x + z.w / 2 - (a.x + a.w / 2), dy = z.y + z.h / 2 - (a.y + a.h / 2);
      const horizontal = Math.abs(dx) * a.h > Math.abs(dy) * a.w;
      const fromSide = o.fromSide ?? (horizontal ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'b' : 't'));
      const toSide = o.toSide ?? (horizontal ? (dx > 0 ? 'l' : 'r') : (dy > 0 ? 't' : 'b'));
      const p0 = api.anchor(from, fromSide, o.t0 ?? 0.5), p1 = api.anchor(to, toSide, o.t1 ?? 0.5);
      const abs = [p0, ...(o.via ?? []), p1];
      const pts = abs.map(([x, y]) => [x - p0[0], y - p0[1]]);
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      // The label is a native Excalidraw arrow label (what double-clicking an arrow creates): it sits on the arrow's
      // midpoint and the renderer cuts a gap in the line around it, so no background box is needed.
      arrows.push({
        type: 'arrow', x: p0[0], y: p0[1], width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys), points: pts,
        start: { id: from }, end: { id: to }, strokeColor: o.color ?? ink, strokeWidth: o.sw ?? 2, strokeStyle: o.dashed ? 'dashed' : 'solid', roughness: 1,
        endArrowhead: o.head === false ? null : 'arrow', startArrowhead: o.both ? 'arrow' : null,
        ...(o.label ? { label: { text: o.label, fontSize: o.labelFs ?? fs - 2, strokeColor: o.labelColor ?? o.color ?? ink } } : {}),
      });
    },
    // Free connector between absolute points (no binding).
    line(points, o = {}) {
      const [x0, y0] = points[0];
      const pts = points.map(([x, y]) => [x - x0, y - y0]);
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      arrows.push({ type: 'arrow', x: x0, y: y0, width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys), points: pts,
        strokeColor: o.color ?? ink, strokeWidth: o.sw ?? 2, strokeStyle: o.dashed ? 'dashed' : 'solid', roughness: 1,
        endArrowhead: o.head === false ? null : 'arrow', startArrowhead: o.both ? 'arrow' : null,
        ...(o.label ? { label: { text: o.label, fontSize: o.labelFs ?? fs - 2, strokeColor: o.color ?? ink } } : {}) });
    },
    elements() { return [...back, ...mid, ...arrows, ...front]; },
  };
  return api;
}
