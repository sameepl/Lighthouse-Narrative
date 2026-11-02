import { describe, expect, it } from 'vitest';
import { inspect, focal, palette, setBudget, unsafe, parseResult } from '../scripts/art-lint.mjs';
const svg = (inside = '') => `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMin slice">${inside}</svg>`;
describe('art structural fixtures', () => {
  it('accepts the minimal contract', () =>
    expect(inspect({ name: 'test', svg: svg('<rect id="test-panel" fill="#4fd8f0"/>') })).toEqual([]));
  it('allows CSS opacity pulse', () =>
    expect(
      inspect({ name: 'test', svg: svg('<style>@keyframes pulse{from{opacity:.4}to{opacity:1}}</style>') }),
    ).toEqual([]));
  it('enforces combined byte budget', () => {
    expect(setBudget([{ svg: ' '.repeat(180 * 1024) }])).toEqual([]);
    expect(setBudget([{ svg: ' '.repeat(180 * 1024 + 1) }])).toEqual(['exceeds 180 KiB']);
  });
  const cases = [
    ['palette', svg('<rect fill="\n #ff00ff"/>')],
    ...['url(#missing) #ff00ff', ' #ff00ff'].map(value => ['palette', svg(`<rect fill="${value}"/>`)]),
    ...['none #ff00ff', 'url(#a),#ff00ff'].map(value => ['palette', svg(`<style>svg{background:${value}}</style>`)]),
    ['unsupported filters', svg('<g style="filter:drop-shadow(0 0 8px #ff00ff)"/>')],
    ['unsupported filters', svg('<g filter="url(#a)"/>')],
    ['unsupported filters', svg('<style>g{backdrop-filter:blur(2px)}</style>')],
    ['viewBox', svg().replace('viewBox=', 'data-viewBox=')],
    ['palette', svg().replace('<svg ', '<svg style="background:red" ')],
    ['palette', svg('<style>svg{background-color:#ef00ff}</style>')],
    ['forbidden element: animate', svg('<animate attributeName="fill" values="#ef00ff;#ff0000"/>')],
    ['forbidden element: set', svg('<set attributeName="fill" to="red"/>')],
    ['unsupported', svg('<style>rect{fill:/*x*/red}</style>')],
    ['active or external', '<!DOCTYPE svg><svg/>'],
    ['external reference', svg('<style>@import url(https://example.org/a)</style>')],
    ['root svg', '<g><svg viewBox="0 0 600 300"/></g>'],
    ['viewBox', svg().replace('600', '601')],
    ['preserveAspectRatio', svg().replace('slice', 'meet')],
    ['14 KiB', svg(' '.repeat(14 * 1024))],
    ...['image', 'script', 'text', 'filter', 'foreignObject', 'font', 'font-face'].map(t => [
      `forbidden element: ${t}`,
      svg(`<${t}/>`),
    ]),
    ['fonts forbidden', svg('<style>rect{font-family:serif}</style>')],
    ['external reference', svg('<use href="https://example.org/a"/>')],
    ['external reference', svg('<rect fill="url(https://example.org/a)"/>')],
    ['active or external', svg('<rect onclick="alert(1)"/>')],
    ['prefix', svg('<g id="wrong"/>')],
    ['duplicate ids', svg('<g id="test-a"/><g id="test-a"/>')],
    ['palette', svg('<rect fill="#ef00ff"/>')],
    ['palette', svg('<rect fill="#ff6a3d"/>')],
  ];
  it.each(cases)('reports %s', (rule, fixture) =>
    expect(inspect({ name: 'test', svg: fixture }).some(e => e.includes(rule))).toBe(true),
  );
  it('allows hazard orange only in skirmish', () => expect(palette('#ff6a3d', 'skirmish')).toBe(true));
  it('reports multiple failures together', () =>
    expect(inspect({ name: 'test', svg: '<svg><text fill="red"/></svg>' }).length).toBeGreaterThan(3));
});
describe('rendered pixel focal approximation', () => {
  const pixel = (x: number, y: number) => {
    const p = new Uint8Array(600 * 300 * 4);
    p.set([255, 255, 255, 255], (y * 600 + x) * 4);
    return p;
  };
  it.each([
    [150, 20],
    [450, 130],
    [300, 75],
  ])('accepts safe pixel %i,%i', (x, y) => expect(focal(pixel(x, y))).toBeNull());
  it.each([
    [149, 75],
    [451, 75],
    [300, 19],
    [300, 131],
  ])('rejects outside pixel %i,%i', (x, y) => expect(focal(pixel(x, y))).toContain('outside'));
  it('rejects no bright mass', () => expect(focal(new Uint8Array(4))).toContain('no luminance'));
  it('ignores transparent light', () => {
    const p = pixel(300, 75);
    p[(75 * 600 + 300) * 4 + 3] = 0;
    expect(focal(p)).toContain('no luminance');
  });
});

describe('bounded paint and renderer result contracts', () => {
  it.each(['#d9a441', '#4fd8f0', '#fff', '#111', 'currentcolor', 'url(#test-a) #fff'])('accepts paint %s', value =>
    expect(inspect({ name: 'test', svg: svg(`<rect fill="${value}"/>`) })).toEqual([]),
  );
  it('distinguishes unsafe rules from benign asset names', () => {
    expect(unsafe({ name: 'reactive-rootcellar', svg: svg('<g id="wrong"/>') })).toBe(false);
    expect(unsafe({ name: 'test', svg: svg('<script/>') })).toBe(true);
    expect(inspect({ name: 'test', svg: svg('<g data-id="wrong"/>') })).toEqual([]);
  });
  it.each(['pending<script>wait</script>', 'oops', '[null,null]', '[42]', '{}'])('rejects renderer body %s', body =>
    expect(() => parseResult(`<body>${body}</body>`, 1)).toThrow(/renderer/),
  );
  it('accepts compact per-image results', () =>
    expect(parseResult('<body>[null,"focal: rendering failed"]</body>', 2)).toEqual([null, 'focal: rendering failed']));
});
