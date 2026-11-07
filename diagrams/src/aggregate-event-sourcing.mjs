import { scene } from '../../scripts/excalidraw/dsl.mjs';
// An event-sourced Aggregate: replay the stream, run the command, append the result.
export default () => {
  const s = scene();

  s.frame('store', 0, 0, 470, 530, 'Event store: one BacklogItem\'s stream', { fill: 'pPurple', stroke: '#7048e8', sw: 3 });
  [['e1', 60, 'v1  BacklogItemPlanned'], ['e2', 134, 'v2  TaskDefined'], ['e3', 208, 'v3  BacklogItemCommitted'], ['e4', 282, 'v4  TaskHoursRemainingEstimated']]
    .forEach(([id, y, label]) => s.box(id, 30, y, 410, 64, label, { fill: 'purple', fs: 18 }));
  s.text(30, 368, 'Append-only: events are never updated', { fs: 17, color: '#495057' });
  s.box('e5', 30, 420, 410, 64, 'v5  TaskHoursRemainingEstimated', { fill: 'green', fs: 18, dashed: true });

  s.box('cmd', 850, 0, 240, 80, 'Command', { fill: 'gray' });
  s.box('agg', 760, 170, 420, 190, 'BacklogItem, rebuilt in memory\nstatus and hours are the result\nof replaying v1 to v4', { fill: 'yellow' });

  s.arrow('store', 'agg', { fromSide: 'r', toSide: 'l', t0: 0.434, t1: 0.316, label: '1. read and replay', labelFs: 18 });
  s.arrow('cmd', 'agg', { fromSide: 'b', toSide: 't', label: '2. execute', labelFs: 18 });
  s.arrow('agg', 'e5', { fromSide: 'l', toSide: 'r', t0: 0.79, label: '3. append,\nif still at v4', labelFs: 18 });

  return { skeleton: s.elements() };
};
