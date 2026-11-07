import { scene } from '../../scripts/excalidraw/dsl.mjs';
// One BacklogItem Aggregate: who may touch what, what commits together, and how it points at the outside world.
export default () => {
  const s = scene();
  const G = '#2f9e44', R = '#e03131', B = '#1971c2';

  s.box('client', 0, 60, 190, 300, 'Client\n(application\nservice)', { fill: 'gray' });

  s.frame('boundary', 430, 0, 790, 520, 'Consistency boundary: the BacklogItem Aggregate', { fill: 'pYellow', stroke: '#f08c00', sw: 3 });
  s.box('root', 460, 60, 730, 100, 'BacklogItem (Aggregate Root)\nglobal identity: BacklogItemId', { fill: 'yellow' });

  s.box('t1', 460, 250, 170, 90, 'Task 1\nlocal identity', { fill: 'blue', fs: 18 });
  s.box('t2', 646, 250, 170, 90, 'Task 2\nlocal identity', { fill: 'blue', fs: 18 });
  s.box('v1', 832, 250, 170, 90, 'StoryPoints', { fill: 'green', fs: 18 });
  s.box('v2', 1018, 250, 170, 90, 'SprintId', { fill: 'green', fs: 18 });
  [['t1', 0.116], ['t2', 0.371], ['v1', 0.626], ['v2', 0.881]].forEach(([id, t0]) => s.arrow('root', id, { fromSide: 'b', toSide: 't', t0 }));

  s.text(460, 352, 'Entities inside the boundary', { fs: 17, color: '#495057' });
  s.text(832, 352, 'Value Objects, replaced whole', { fs: 17, color: '#495057' });
  s.text(460, 420, 'One transaction: all of this commits together,\nor none of it does.', { fs: 20 });

  s.arrow('client', 'root', { fromSide: 'r', toSide: 'l', t0: 0.167, color: G, label: 'commands', labelFs: 19 });
  s.arrow('client', 't1', { fromSide: 'r', toSide: 'l', t0: 0.783, dashed: true, color: R, label: 'direct access ✗', labelFs: 19 });

  s.box('repo', 430, 640, 300, 90, 'BacklogItemRepository', { fill: 'purple', fs: 18 });
  s.arrow('repo', 'boundary', { fromSide: 't', toSide: 'b', t1: 0.19, label: 'loads and\nsaves it whole', labelFs: 17 });
  s.box('norepo', 750, 640, 270, 90, 'TaskRepository ✗\ninternal parts have none', { fill: 'pRed', stroke: R, dashed: true, tc: R, fs: 17 });

  s.box('sprint', 1040, 640, 180, 90, 'Sprint\nanother Aggregate', { fill: 'gray', fs: 17 });
  s.arrow('v2', 'sprint', { fromSide: 'b', toSide: 't', t0: 0.659, dashed: true, color: B, label: 'identity only', labelFs: 18 });

  return { skeleton: s.elements() };
};
