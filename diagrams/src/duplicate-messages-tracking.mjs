import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene();
  s.box('msg', 0, 170, 170, 100, 'Message\nid: xyz', { fill: 'purple' });
  s.box('consumer', 270, 170, 170, 100, 'Consumer', { fill: 'teal' });
  s.frame('tx', 690, 0, 600, 440, 'One database transaction', { fill: 'pYellow', stroke: '#f08c00' });
  s.box('processed', 730, 70, 520, 120, 'PROCESSED_MESSAGES table\nMSG_ID (primary key): xyz', { fill: 'blue' });
  s.box('app', 730, 270, 520, 120, 'Application table\n(the business data)', { fill: 'green' });
  s.arrow('msg', 'consumer');
  s.arrow('consumer', 'processed', { fromSide: 'r', toSide: 'l', via: [[560, 220], [560, 130]], label: '1. INSERT message id', labelAt: [560, 110], labelFs: 18 });
  s.arrow('consumer', 'app', { fromSide: 'r', toSide: 'l', via: [[560, 220], [560, 330]], label: '2. UPDATE', labelAt: [560, 330], labelFs: 18 });
  s.note('dup', 0, 330, 440, 110, 'A duplicate message makes the INSERT fail\n(primary key violation), so the whole\ntransaction rolls back and the message is discarded.', { fill: 'pRed', stroke: '#e03131', fs: 17 });
  return { skeleton: s.elements() };
};
