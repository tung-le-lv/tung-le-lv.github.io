import { scene } from '../../scripts/excalidraw/dsl.mjs';
export default () => {
  const s = scene({ fs: 18 });
  const F = 16;

  // ---------- top row: client, edge, identity
  s.box('cl', 0, 60, 250, 110, 'Client devices\nTV, mobile, web\n(Netflix SDK, ABR player)', { fill: 'gray', fs: F });
  s.frame('ed', 330, 10, 1040, 220, 'Edge and security', { fill: 'pPurple', stroke: '#7048e8' });
  s.box('r53', 350, 75, 215, 115, 'Route 53\ngeo/latency DNS,\nregion failover', { fill: 'white', fs: F });
  s.box('waf', 595, 75, 215, 115, 'AWS Shield / WAF\nDDoS + request\nfiltering', { fill: 'white', fs: F });
  s.box('elb', 840, 75, 215, 115, 'ELB / NLB\nzone-aware\nbalancing', { fill: 'white', fs: F });
  s.box('zuul', 1085, 75, 260, 115, 'Zuul API gateway\nTLS, dynamic routing,\nshedding, canary', { fill: 'yellow', fs: F });
  s.frame('idf', 1450, 10, 600, 220, 'Identity: authN and authZ', { fill: 'pRed', stroke: '#e03131' });
  s.box('pass', 1470, 75, 250, 115, 'Passport / token service\ntoken-agnostic identity\nminted at the edge', { fill: 'white', fs: F });
  s.box('ent', 1780, 75, 250, 115, 'Membership and\nentitlements (authZ)\nplan, profile, region', { fill: 'white', fs: F });
  s.arrow('cl', 'r53', { label: '1', labelAt: [292, 118], labelFs: 15 });
  s.arrow('r53', 'waf'); s.arrow('waf', 'elb'); s.arrow('elb', 'zuul');
  s.arrow('zuul', 'pass', { label: '2 authN', labelAt: [1410, 108], labelFs: 14 });
  s.arrow('pass', 'ent', { label: '3', labelAt: [1750, 118], labelFs: 14 });
  s.arrow('zuul', 'cl', { fromSide: 't', toSide: 't', dashed: true, color: '#2f9e44', via: [[1215, -45], [125, -45]], label: '7 response', labelAt: [700, -45], labelFs: 15 });

  // ---------- AWS region
  s.frame('reg', 330, 310, 1780, 850, 'AWS region: EC2 auto-scaling groups (multi-AZ) + Titus containers · Spinnaker red/black deploys · 3+ regions active-active', { fill: 'pBlue', stroke: '#1c7ed6', ty: 812, tx: 70, fs: 17 });
  s.box('dgs', 380, 380, 300, 90, 'GraphQL federated gateway (DGS)\ncomposes device views', { fill: 'white', fs: F });
  s.box('plat', 720, 380, 520, 90, 'Platform: Eureka discovery · gRPC + client-side LB\ncircuit breakers · chaos tools', { fill: 'white', fs: F, dashed: true });
  s.frame('dom', 380, 570, 860, 230, 'Domain microservices (gRPC, deadline-propagated)', { fill: 'pGreen', stroke: '#2f9e44', fs: 17 });
  [['Playback service', 0, 0], ['Recommendations', 1, 0], ['Catalog / metadata', 2, 0], ['Search', 0, 1], ['Viewing history', 1, 1], ['User / profiles', 2, 1]].forEach(([n, c, r], i) => s.box(`ms${i}`, 405 + c * 270, 630 + r * 90, 240, 70, n, { fill: 'green', fs: F }));
  s.frame('dat', 1330, 380, 760, 440, 'Data tier (cache-first)', { fill: 'pOrange', stroke: '#e8590c', fs: 17 });
  [['EVCache\nmemcached, per-AZ', 0, 0], ['Cassandra\nsource of truth', 1, 0], ['MySQL / CockroachDB\nbilling, ACID', 2, 0], ['Elasticsearch\nsearch index', 0, 1], ['S3\nobjects, data lake, backups', 1, 1], ['Hollow\nin-memory catalog', 2, 1], ['DynamoDB / KeyValue\ncommon data-access layer', 0, 2]]
    .forEach(([n, c, r], i) => s.box(`d${i}`, 1355 + c * 245, 440 + r * 110, 215, 85, n, { fill: 'orange', fs: 15 }));
  s.note('dn', 1600, 660, 460, 85, 'Cache-first reads: EVCache hit (sub-millisecond),\nelse Cassandra. Hollow = local memory, zero RPC.', { fs: 15 });
  s.frame('evf', 380, 860, 1710, 240, 'Event services: async backbone', { fill: 'pYellow', stroke: '#f08c00', fs: 17 });
  s.box('kafka', 410, 940, 240, 95, 'Kafka (Keystone)\ntrillions of events/day', { fill: 'white', fs: F });
  s.box('flink', 730, 940, 240, 95, 'Flink\nstream processing', { fill: 'white', fs: F });
  s.box('sqs', 1050, 940, 200, 95, 'SQS\nwork queues', { fill: 'white', fs: F });
  s.box('cons', 1330, 940, 730, 95, 'Consumers: viewing history, recs training, analytics, experiments\neach updates its own store (eventual consistency)', { fill: 'white', fs: F });
  s.arrow('kafka', 'flink', { dashed: true }); s.arrow('flink', 'sqs', { dashed: true }); s.arrow('sqs', 'cons', { dashed: true });

  s.arrow('zuul', 'dgs', { fromSide: 'b', toSide: 't', via: [[1215, 290], [530, 290]], label: '4 route', labelAt: [900, 290], labelFs: 15 });
  s.arrow('dgs', 'dom', { fromSide: 'b', toSide: 't', t1: 0.175, label: '5 gRPC fan-out, deadline ~800 ms', labelAt: [530, 520], labelFs: 15 });
  s.arrow('dom', 'dat', { fromSide: 'r', toSide: 'l', t0: 0.5, t1: 0.693, label: '6 cache-first reads', labelAt: [1285, 655], labelFs: 14 });
  s.arrow('dom', 'evf', { fromSide: 'b', toSide: 't', t0: 0.5, t1: 0.255, label: '9 async events', labelAt: [810, 840], labelFs: 14 });

  // ---------- CDN + observability
  s.box('oc', 330, 1230, 900, 130, 'Open Connect CDN\nOCAs at IXPs and embedded in ISPs\ndelivers all video bytes; filled off-peak from the S3 origin', { fill: 'red', fs: 18 });
  s.frame('obs', 1500, 1230, 590, 480, 'Observability (continuous, async)', { fill: 'pBlue', stroke: '#1c7ed6', fs: 17 });
  ['Atlas: dimensional time-series metrics', 'Edgar: distributed tracing across gRPC hops', 'Mantis: real-time operational streams', 'Logging: Keystone pipeline to\nElasticsearch (search) + S3 (archive)', 'Alerting and dashboards:\nanomaly detection on Atlas streams']
    .forEach((n, i) => s.box(`ob${i}`, 1525, 1290 + i * 84, 540, 70, n, { fill: 'white', fs: 15 }));
  s.arrow('dom', 'oc', { fromSide: 'l', toSide: 't', t1: 0.024, via: [[352, 695]], label: '8 DRM license + OCA URLs', labelAt: [268, 960], labelFs: 15 });
  s.arrow('oc', 'cl', { fromSide: 'l', toSide: 'l', via: [[-70, 1295], [-70, 115]], color: '#e03131', sw: 4, label: 'video bytes\n(adaptive bitrate over HTTPS)', labelAt: [-70, 700], labelFs: 16 });
  s.arrow('reg', 'obs', { fromSide: 'b', toSide: 't', t0: 0.823, t1: 0.5, dashed: true, label: '10 metrics, traces, logs', labelAt: [1795, 1195], labelFs: 15 });

  // ---------- legend
  s.frame('leg', 330, 1400, 1120, 270, 'Request flow: a user opens the app and presses play', { fill: 'pGray', stroke: '#868e96', fs: 18 });
  s.text(355, 1455, [
    '1   DNS: Route 53 resolves to the nearest healthy region',
    '2   TLS through WAF, ELB and Zuul; Zuul validates the device token (authN)',
    '3   authZ: membership and entitlements (plan, profile, region rights)',
    '4   Zuul routes to the GraphQL federated gateway, which composes the view',
    '5   gRPC fan-out to domain services (Eureka, client LB, ~800 ms deadline)',
    '6   Data reads: EVCache first, Cassandra on a miss; Hollow for catalog metadata',
    '7   The composed response returns to the device',
    '8   Press play: playback + steering return a DRM license and ranked OCA URLs',
    '9   Async: play and impression events go to Kafka; nobody waits',
    '10  Continuous: metrics, traces and logs flow to the observability stack',
  ].join('\n'), { fs: 16 });
  return { skeleton: s.elements(), scale: 1.25 };
};
