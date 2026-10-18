// Prototype slice: "The Written Clause". Data-driven, engine-agnostic.
// Marcus is never written for: narration covers the world and NPCs only; choices are the player's intents.
// PLACEHOLDERS: Marcus's characteristics/skills and the Credits/Strain numbers are invented for the slice.

export const story = {
  start: 'hall',
  reserve: 40000,
  player: {
    name: 'Marcus Torin',
    chars: { STR: 7, DEX: 8, END: 8, INT: 10, EDU: 10, SOC: 9 },
    skills: {
      Leadership: 2, Tactics: 2, Persuade: 1, Diplomat: 2, Pilot: 2, Gunnery: 1,
      Electronics: 1, Mechanic: 0, Recon: 1, 'Gun Combat': 1, Astrogation: 1,
    },
    res: { Credits: 52000, Edge: 3, Strain: 0 },
    max: { Edge: 3, Strain: 5 },
  },
  skillChar: {
    Leadership: 'SOC', Persuade: 'SOC', Diplomat: 'SOC', Tactics: 'INT', Pilot: 'DEX', Gunnery: 'DEX',
    Electronics: 'EDU', Mechanic: 'EDU', Recon: 'INT', 'Gun Combat': 'DEX', Astrogation: 'EDU',
  },
  nodes: {},
};

const note = (kind, t) => ({ kind, t });

// ---- Approach 1: press for parity -------------------------------------------------
const parityClean = [
  'Renata is silent for a long beat. Then she draws the third page toward her and uncaps a pen. “For every hull,” she says, writing. “On the ring and the lanes. In ink.”',
  'Priya lets out a breath she has clearly been holding.',
];
const parityGain = [
  note('gain', 'The self-defence clause is written for every hull on Compact lanes, yours included.'),
  note('gain', 'Merchants and tug crews trust your alliance more.'),
];
const pressForParity = {
  text: 'Press for parity',
  sub: 'Persuade / Diplomat',
  check: {
    skills: ['Persuade', 'Diplomat'], target: 8,
    bonus: [{ flag: 'priya_read', n: 1, label: 'Priya’s reading' }],
    grades: {
      clean: { text: parityClean, fx: { notes: parityGain }, goto: 'after' },
      cost: {
        text: [...parityClean,
          'Halvorsen’s pen is moving too. Four hulls, one captain, written down in a column. “The Compact will want to know how large you mean to become,” he says, to no one in particular.'],
        fx: { notes: [...parityGain, note('cost', 'The Compact grows wary of your fleet’s size. Strain with the Compact +1.')], add: { Strain: 1 } },
        goto: 'after',
      },
      fail: {
        text: ['Renata squares the pages and slides one stack, then the other, toward Priya. “No. Berth and standing. Not arms.” She does not raise her voice. “I will remember that you asked for the whole table.”'],
        fx: { notes: [note('cost', 'You leave with the berth and standing pages only. No arms clause.'),
          note('cost', 'Renata remembers you pushed. Strain with the Compact +1.')], add: { Strain: 1 } },
        goto: 'after',
      },
    },
  },
};

// ---- Approach 2: protected-escort status ------------------------------------------
const escortClean = [
  'Renata turns the third page over and writes on the back, slowly, counting as she goes. “Escorts of record. Defence of other hulls on Compact lanes. Priority on contested jobs.” She caps the pen. “In return: hours, owed. And you report to this room, on a schedule, for as long as the clause stands.”',
];
const escortNotes = [
  note('gain', 'Explicit protection as escorts of record, with priority on contested jobs.'),
  note('cost', 'In return: escort hours owed, and a standing reporting duty to the Compact.'),
];
const escortStatus = {
  text: 'Ask for protected-escort status',
  sub: 'Leadership / Tactics',
  check: {
    skills: ['Leadership', 'Tactics'], target: 8,
    bonus: [{ flag: 'priya_read', n: 1, label: 'Priya’s reading' }],
    grades: {
      clean: { text: escortClean, fx: { notes: escortNotes, flags: ['escort'] }, goto: 'after' },
      cost: {
        text: [...escortClean,
          '“The hours are the high figure,” she says, without apology. “Halvorsen will be your reporting officer.” Halvorsen inclines his head a quarter inch.'],
        fx: { notes: [...escortNotes, note('cost', 'Hours set at the heavy end, and Halvorsen is your reporting officer. Owed hours displace paid work: Credits −3,000.')],
          add: { Credits: -3000 }, flags: ['escort'] },
        goto: 'after',
      },
      fail: {
        text: ['“You are asking for a favour the Compact cannot afford,” Renata says. She sets her hand flat on the charter. “The offer stays on this table for one cycle. Berth priority is another matter.” Priya’s pencil stops moving.'],
        fx: { notes: [note('cost', 'The offer stands for one cycle, but your berth priority slips.'),
          note('cost', 'Renata thinks you want special treatment. Strain with the Compact +1.')], add: { Strain: 1 } },
        goto: 'after',
      },
    },
  },
};

const declineForNow = {
  text: 'Decline for now', goto: 'unsigned',
};

story.nodes = {
  hall: {
    bg: 'hall',
    text: [
      'Renata lays the charter on the table between you and does not push it across.',
      '“Three pages,” she says. “Berth, standing, arms. Hull by hull, with hours.” She taps the third page. “This is the one you want. And the one that costs.”',
      'Priya reads upside down, lips moving. She sets two fingers on a clause and says nothing.',
      '“Your people carry peace-bonded weapons on the ring. Fine. Your ships fire only in defence of life, ship and traffic. Also fine. But I will not write that down for you, because the moment it is written, I must write it for everyone.” Renata counts on her fingers. “The merchants. The tugs. The visiting navy. Every hull. And they have asked, Captain. Many times.”',
      'Halvorsen looks at the viewport, at your ships, then at you.',
      'Your crews already defend Hearthline’s traffic, yet you hold only an informal understanding. A hijack on the lanes could land them in an after-action review with nothing on paper to stand behind.',
    ],
    choices: [
      pressForParity,
      escortStatus,
      { text: 'Take the pages away and let Priya read them', sub: 'No roll', goto: 'priya_report', if: { notFlag: 'priya_read' } },
      declineForNow,
    ],
  },
  priya_report: {
    bg: 'hall',
    text: [
      'Priya brings the pages back before the cycle turns, her notes in small tight script down every margin.',
      '“It is what Renata said, and no worse,” she says. “The arms clause binds the Compact to the same words for every hull, so push there and it reads as a precedent, not a favour. The escort clause is narrower, with hours and a reporting duty. But I know where she has room to move. I have marked it.”',
    ],
    choices: [{
      text: 'Return to the hall',
      fx: {
        flags: ['priya_read'],
        notes: [
          note('gain', 'Priya’s reading gives you +1 on either approach.'),
          note('watch', 'Renata notes the delay. A rival hull may take the berth you wanted.'),
        ],
      },
      goto: 'hall2',
    }],
  },
  hall2: {
    bg: 'hall',
    text: [
      'The charter lies where Renata left it, three pages square to the table’s edge. Priya’s pencilled marks run down the margins now.',
      '“One cycle,” Renata says. “The offer stands until then. I do not extend.”',
    ],
    choices: [pressForParity, escortStatus, declineForNow],
  },
  unsigned: {
    bg: 'hall',
    text: ['Renata gathers the charter without comment and squares it against the table’s edge. What stays unwritten stays unwritten.'],
    choices: [{
      text: 'Continue', goto: 'after',
      fx: { notes: [note('watch', 'Nothing is written down. Your crews remain covered only by an informal understanding.')] },
    }],
  },
  after: {
    bg: 'hall', end: true, summary: true,
    text: [
      'The council room empties by degrees. Through the viewport your four hulls ride quietly at their arms, hull numbers lit amber against the dark.',
      '<b>End of prototype slice.</b>',
    ],
    choices: [],
  },
};
