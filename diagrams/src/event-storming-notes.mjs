import { scene } from '../../scripts/excalidraw/dsl.mjs';
// The six Event Storming sticky notes and what each one means.
export default () => {
  const s = scene();
  const notes = [
    ['Domain\nEvent', '#ffa94d', '#e8590c', 'A verb in the past tense\n(for example ProductCreated).\nThe foundation of the process.'],
    ['Command', '#74c0fc', '#1c7ed6', 'An imperative verb (for example\nCreateProduct) that triggers\na Domain Event.'],
    ['Aggregate', '#fff3bf', '#f08c00', 'The entity or data holder\nwhere commands execute.'],
    ['Role', '#ffe066', '#f08c00', 'A specific user type (for example\nProduct Owner) who starts an\naction. Placed on a Command.'],
    ['Process', '#d0bfff', '#7048e8', 'A complex, multi-step operation\ntriggered by an event or\na command.'],
    ['Hotspot', '#f783ac', '#c2255c', 'A trouble spot, bottleneck or\nconflict in the current process\nthat needs more investigation.'],
  ];
  notes.forEach(([label, fill, stroke, caption], i) => {
    const x = (i % 3) * 400, y = Math.floor(i / 3) * 370;
    s.box(`n${i}`, x + 50, y, 240, 180, label, { fill, stroke, fs: 32, sw: 2.5, round: false });
    s.box(`c${i}`, x, y + 200, 340, 120, caption, { fill: 'none', stroke: 'transparent', fs: 19 });
  });
  return { skeleton: s.elements(), scale: 2 };
};
