// Validates every data file at load time. A malformed file fails the build, the dev server and the tests
// with a message naming the bad field, instead of silently breaking a scene.
import { z } from 'zod';

export const CHARACTERISTICS = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'] as const;
const Characteristic = z.enum(CHARACTERISTICS);
const Score = z.number().int().min(2).max(12);

export const RulesSchema = z.object({
  defaultTarget: z.number().int(),
  cleanMargin: z.number().int().min(1),
  charMods: z.array(z.tuple([z.number().int(), z.number().int()])).min(1),
  skillChar: z.record(z.string(), Characteristic),
  resources: z.record(
    z.string(),
    z.object({
      start: z.number().int(),
      min: z.number().int(),
      max: z.number().int().optional(),
      reserve: z.number().int().optional(),
      placeholder: z.boolean().optional(),
    }),
  ),
  bonuses: z.record(z.string(), z.object({ label: z.string(), n: z.number().int() })),
  cycle: z.object({
    actions: z.number().int().positive(),
    pursuit: z.object({
      length: z.number().int().positive(),
      sliceLength: z.number().int().positive(),
      base: z.number().int(),
      renownThreshold: z.number().int(),
      renownDelta: z.number().int(),
      loudDelta: z.number().int(),
      quietDelta: z.number().int(),
    }),
    edgeTrust: z.number().int().min(0).max(3),
    edgeReward: z.number().int().positive(),
    trustedAssistBonus: z.number().int().nonnegative(),
  }),
});

export const CharacterSchema = z.object({
  name: z.string(),
  placeholder: z.boolean().optional(),
  chars: z.object(
    Object.fromEntries(CHARACTERISTICS.map(c => [c, Score])) as Record<(typeof CHARACTERISTICS)[number], typeof Score>,
  ),
  skills: z.record(z.string(), z.number().int().min(0).max(4)),
});

export const CrewSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    faction: z.string(),
    assignable: z.boolean(),
    assist: z.object({ skill: z.string(), n: z.number().int().min(0) }),
    trait: z.string().min(1),
    trust: z.number().int().min(0).max(3),
    placeholder: z.boolean().optional(),
  }),
);

export const ShipsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    main: z.boolean(),
    tags: z.array(z.string().min(1)),
    upkeep: z.number().int().nonnegative(),
    placeholder: z.boolean().optional(),
  }),
);

export type Rules = z.infer<typeof RulesSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Crew = z.infer<typeof CrewSchema>;
export type Ships = z.infer<typeof ShipsSchema>;
export type Characteristic = z.infer<typeof Characteristic>;

const ContentId = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/, 'Expected lowercase snake_case');
const CycleNumber = z.number().int().positive();
const Archetype = z.enum(['trade_run', 'courier', 'salvage', 'scout', 'distress_call', 'standoff']);
const Requirements = z.strictObject({
  minCredits: z.number().int().nonnegative().optional(),
  shipTag: ContentId.optional(),
  gear: z.array(ContentId).optional(),
  crew: z.array(ContentId).optional(),
  flags: z.array(ContentId).optional(),
  cycle: z
    .strictObject({ min: CycleNumber.optional(), max: CycleNumber.optional() })
    .refine(v => v.min === undefined || v.max === undefined || v.min <= v.max, 'min must not exceed max')
    .optional(),
});

export const EncounterSchema = z.strictObject({
  id: ContentId,
  knot: ContentId,
  title: z.string().min(1),
  layer: z.enum(['crisis', 'commercial']),
  archetype: Archetype,
  tags: z.array(ContentId),
  requires: Requirements,
  repeat: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('once') }),
    z.strictObject({ kind: z.literal('repeatable'), cooldown: z.number().int().nonnegative() }),
  ]),
  weight: z.number().positive(),
  cost: z.number().int().nonnegative(),
  risk: z.string().min(1),
  lead: ContentId.optional(),
  placeholder: z.boolean().optional(),
});

export const KeystoneSchema = z
  .strictObject({
    id: ContentId,
    knot: ContentId,
    title: z.string().min(1),
    elevates: Archetype,
    availableWhen: z
      .strictObject({ lead: ContentId.optional(), cycle: CycleNumber.optional() })
      .refine(v => v.lead !== undefined || v.cycle !== undefined, 'Needs a lead or cycle'),
    deadline: CycleNumber,
    piece: z.enum(['removed', 'six', 'claim', 'none']),
    requires: Requirements,
    placeholder: z.boolean().optional(),
  })
  .refine(v => v.availableWhen.cycle === undefined || v.availableWhen.cycle <= v.deadline, {
    path: ['deadline'],
    message: 'deadline must not precede availableWhen.cycle',
  });

export type Encounter = z.infer<typeof EncounterSchema>;
export type Keystone = z.infer<typeof KeystoneSchema>;
