import { describe, expect, it } from 'vitest';
import { lintScene, nounPhrases, rules, type Scene } from '../scripts/content-gates.mjs';
// Synthetic prose deliberately varies sentence beginnings, objects and actors.
const actors = ['Amber', 'Beryl', 'Coral', 'Dahlia', 'Ember', 'Flint', 'Garnet', 'Hazel', 'Indigo', 'Jasper'];
function fixture(): Scene {
  const passage = (i: number) => ({
    name: `stub_fixture__a${Math.floor((i - 1) / 3) + 1}_${['clean', 'cost', 'fail'][(i - 1) % 3]}`,
    text: `[STUB] ${actors[i]} watches distant machinery carry a battered metal cylinder toward several waiting workers beside silent equipment. Nearby cranes lift heavy containers above weathered walkways before lunch while pale lamps illuminate empty corridors. Outside ships drift. Beyond glass stars gleam against deep darkness tonight.`,
    effects: [['Credits', i % 3 === 1 ? 1500 : -500]] as [string, number][],
    notes: [`[STUB] Credits ${i % 3 === 1 ? '+1,500' : '-500'}`],
    grade: ['clean', 'cost', 'fail'][(i - 1) % 3],
  });
  const scene: Scene = {
    id: 'stub_fixture',
    location: 'docs/canon/locations/the-shoal.md',
    encounter: { id: 'stub_fixture', knot: 'stub_fixture_scene', archetype: 'scout', layer: 'commercial' },
    open: passage(0),
    outcomes: Array.from({ length: 9 }, (_, i) => passage(i + 1)),
    ending: {
      name: 'stub_fixture__after',
      text: '[STUB] Here at the Shoal, the ledger card follows.',
      effects: [],
      notes: [],
    },
  };
  // Rotate all sentence openers, not just the first sentence.
  [scene.open, ...scene.outcomes].forEach((p, i) => {
    p.text = p.text
      .replace('a battered metal cylinder', actors[i] + ' metalwork')
      .replace('Nearby cranes', `${actors[i]} cranes`)
      .replace('Outside ships', `${actors[i]} ships`)
      .replace('Beyond glass', `${actors[i]} glass`);
  });
  return scene;
}
const errors = (mutate: (s: Scene) => void) => {
  const s = fixture();
  mutate(s);
  return lintScene(s).join('\n');
};

describe('content lint gates (synthetic regressions for PR60/61 patterns)', () => {
  it('accepts a complete scene, comma-formatted notes and a short ending', () =>
    expect(lintScene(fixture())).toEqual([]));
  it.each([
    [
      'sentence-shape',
      (s: Scene) => {
        s.open.text = '[STUB] ' + 'word '.repeat(45) + '.';
      },
    ],
    [
      'words',
      (s: Scene) => {
        s.open.text = '[STUB] Too short.';
      },
    ],
    [
      'words',
      (s: Scene) => {
        s.ending.text = '[STUB] ' + 'word '.repeat(41);
      },
    ],
    [
      'marker',
      (s: Scene) => {
        s.open.text = s.open.text.replace('[STUB] ', '');
      },
    ],
    [
      'banned',
      (s: Scene) => {
        s.open.text += ' The process concludes.';
      },
    ],
    [
      'opener',
      (s: Scene) => {
        s.open.text += ' Nothing moves. Nothing changes. Nothing shifts.';
        s.open.text = s.open.text.replaceAll('Nothing', 'The machine');
      },
    ],
    [
      'outcome-opening',
      (s: Scene) => {
        s.outcomes[1]!.text = s.outcomes[0]!.text;
      },
    ],
    [
      'noun-phrase',
      (s: Scene) => {
        s.outcomes.slice(0, 3).forEach(p => {
          p.text += ' Beside the convoy master.';
        });
      },
    ],
    [
      'note-effects',
      (s: Scene) => {
        s.outcomes[0]!.notes = ['[STUB] Credits +2,000'];
      },
    ],
    [
      'note-effects',
      (s: Scene) => {
        s.outcomes[0]!.notes = ['[STUB] Credits +1,500 and 3 tickets'];
      },
    ],
    [
      'effect-required',
      (s: Scene) => {
        s.outcomes[1]!.effects = [];
      },
    ],
    [
      'effect-required',
      (s: Scene) => {
        s.outcomes[2]!.effects = [];
      },
    ],
    [
      'clean-gain',
      (s: Scene) => {
        s.outcomes[0]!.effects = [['Credits', -500]];
      },
    ],
    [
      'effect-band',
      (s: Scene) => {
        s.outcomes[0]!.effects = [['Credits', 999]];
      },
    ],
    [
      'effect-band',
      (s: Scene) => {
        s.outcomes[1]!.effects = [['Credits', 500]];
      },
    ],
    [
      'ending-state',
      (s: Scene) => {
        s.state_nouns = ['citation'];
        s.ending.text += ' A citation waits.';
      },
    ],
    [
      'ending-state',
      (s: Scene) => {
        s.ending.text += ' Cargo moves.';
      },
    ],
    [
      'layer',
      (s: Scene) => {
        s.encounter.layer = 'crisis';
      },
    ],
    [
      'layer',
      (s: Scene) => {
        s.encounter.archetype = 'distress_call';
      },
    ],
  ] as const)('rejects %s', (gate, mutate) => expect(errors(mutate)).toContain(`${gate}:`));
  it('uses phrase boundaries, not substrings', () =>
    expect(
      errors(s => {
        s.open.text += ' Unstable tables.';
      }),
    ).not.toContain('banned: stable'));
  it('detects actual nominal chunks and excludes functional verb openers', () => {
    expect(nounPhrases('The convoy master nods. The battered copper plate shakes.')).toEqual([
      'the convoy master',
      'the battered copper',
      'the battered copper plate',
    ]);
    expect(nounPhrases('The chief reads the sheet. The tug moves into the bay. The clerk hands over paper.')).toEqual(
      [],
    );
  });
});

it('requires explicit loud/quiet authorization for Pursuit', () => {
  const s = fixture(),
    outcome = s.outcomes[0]!;
  outcome.effects.push(['Pursuit', -1]);
  outcome.notes[0] += ', Pursuit -1';
  expect(lintScene(s).join('\n')).toContain('effect-band');
  s.loud_quiet = { [outcome.name]: 'quiet' };
  expect(lintScene(s)).toEqual([]);
});
it('rejects the observed PR60 courier promise without an effect', () => {
  const s = fixture(),
    p = s.outcomes[0]!;
  p.text =
    '[STUB] The dispatch staff accepts the parley and reviews the manifest. They confirm the sealed container matches the listed delivery window. The counter clerk stamps the paperwork with a clean approval mark. No additional fees are quoted during this interaction. The staff member gestures toward the open dispatch lane. The process concludes without any recorded discrepancies or delays.';
  p.effects = [];
  p.notes = ['[STUB] The current dispatch window is cleared without an extra fee.'];
  const result = lintScene(s).join('\n');
  expect(result).toContain('banned: accepts the parley');
  expect(result).toContain('clean-gain');
});
it('rejects the observed PR61 scout ending state', () => {
  expect(
    errors(s => {
      s.ending.text = '[STUB] Staff can direct the next inquiry to the review queue or a later window.';
    }),
  ).toContain('ending-state');
});

it.each([
  [-1500, true],
  [-500, true],
  [-499, false],
  [-1, false],
  [0, true],
  [1000, true],
  [1001, false],
])('cost Credits boundary %i uses configured ranges', (value, valid) => {
  const s = fixture(),
    p = s.outcomes[1]!;
  p.effects = [
    ['Credits', value],
    ['Strain', 1],
  ];
  p.notes = ['[STUB] Credits ' + (value >= 0 ? '+' : '') + value + ', Strain +1'];
  expect(lintScene(s).some(e => e.includes('effect-band'))).toBe(!valid);
});
it('reads edited numeric bands without changing gate code', () => {
  const saved = rules.bands.cost!.Credits!;
  try {
    rules.bands.cost!.Credits = [...saved, [-250, -50]];
    const s = fixture(),
      p = s.outcomes[1]!;
    p.effects = [['Credits', -100]];
    p.notes = ['[STUB] Credits -100'];
    expect(lintScene(s)).toEqual([]);
  } finally {
    rules.bands.cost!.Credits = saved;
  }
});
