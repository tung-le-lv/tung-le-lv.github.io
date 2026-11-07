import { scene } from '../../scripts/excalidraw/dsl.mjs';
// One business action across two Aggregates: two transactions joined by a domain event and an outbox.
export default () => {
  const s = scene();

  s.frame('t1', 0, 0, 640, 300, 'Transaction 1: changes one Aggregate', { fill: 'pBlue', stroke: '#1c7ed6', sw: 3 });
  s.box('item', 30, 70, 240, 190, 'BacklogItem\ncommitTo(sprint)', { fill: 'yellow' });
  s.box('row', 410, 70, 210, 80, 'BacklogItem\nstate', { fill: 'white', fs: 18 });
  s.box('outbox', 410, 180, 210, 90, 'Outbox row:\nBacklogItemCommitted', { fill: 'purple', fs: 16 });
  s.arrow('item', 'row', { fromSide: 'r', toSide: 'l', t0: 0.21, label: 'saves', labelFs: 18 });
  s.arrow('item', 'outbox', { fromSide: 'r', toSide: 'l', t0: 0.816, label: 'records', labelFs: 18 });

  s.box('gap', 655, 85, 230, 130, 'No shared transaction.\nThe delay is agreed\nwith the business.', { fill: 'pYellow', stroke: '#f59f00', sw: 1.5, fs: 18 });

  s.frame('t2', 900, 0, 560, 300, 'Transaction 2: changes another Aggregate', { fill: 'pGreen', stroke: '#2f9e44', sw: 3 });
  s.box('sprint', 940, 80, 490, 160, 'Sprint\nrecords the committed BacklogItem', { fill: 'yellow' });

  s.box('relay', 410, 430, 210, 90, 'Message relay', { fill: 'orange' });
  s.box('broker', 760, 430, 220, 90, 'Message broker', { fill: 'teal' });
  s.box('handler', 1170, 430, 220, 90, 'Event handler', { fill: 'blue' });

  s.arrow('outbox', 'relay', { label: 'polls or tails the log', labelFs: 18 });
  s.arrow('relay', 'broker', { label: 'publishes', labelFs: 18 });
  s.arrow('broker', 'handler', { dashed: true, label: 'at least once', labelFs: 18 });
  s.arrow('handler', 'sprint', { fromSide: 't', toSide: 'b', t1: 0.694, label: 'updates', labelFs: 18 });

  s.box('retry', 1000, 550, 460, 76, 'On failure the message is redelivered,\nso the handler must be idempotent.', { fill: 'pYellow', stroke: '#f59f00', sw: 1.5, fs: 18 });

  return { skeleton: s.elements() };
};
