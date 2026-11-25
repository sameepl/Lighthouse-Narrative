// Validates every data file at load time. A malformed file fails the build, the dev server and the tests
// with a message naming the bad field, instead of silently breaking a scene.
import { z } from 'zod';

export const CHARACTERISTICS = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'] as const;
const Characteristic = z.enum(CHARACTERISTICS);
const Score = z.number().int().min(2).max(12);

const UpkeepSchema = z
  .strictObject({
    placeholder: z.literal(true),
    arrearsLimit: z.number().int().positive(),
    warningLead: z.number().int().min(2),
    targetFrom: z.number().int().positive(),
    targetPenalty: z.number().int().positive(),
    renownLoss: z.number().int().positive(),
    strainFrom: z.number().int().positive(),
    strainGain: z.number().int().positive(),
  })
  .refine(v => v.warningLead < v.arrearsLimit, {
    path: ['warningLead'],
    message: 'warningLead must be less than arrearsLimit',
  })
  .refine(v => v.targetFrom <= v.strainFrom && v.strainFrom < v.arrearsLimit, {
    path: ['strainFrom'],
    message: 'thresholds must satisfy targetFrom <= strainFrom < arrearsLimit',
  });

export const SHIP_TAGS = ['armed', 'fast', 'armoured', 'quiet', 'hub', 'workshop', 'sickbay'] as const;
const ShipTag = z.enum(SHIP_TAGS);

export const RulesSchema = z
  .object({
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
    shipModifiers: z
      .array(
        z.strictObject({
          tag: ShipTag,
          skills: z.array(z.string()).min(1),
          n: z.number().int().positive(),
          placeholder: z.literal(true),
        }),
      )
      .superRefine((entries, ctx) => {
        const tags = entries.map(entry => entry.tag);
        if (new Set(tags).size !== tags.length) ctx.addIssue({ code: 'custom', message: 'Duplicate modifier tag' });
      }),
    cycle: z.object({
      actions: z.number().int().positive(),
      upkeep: UpkeepSchema,
      pursuit: z
        .object({
          length: z.number().int().positive(),
          sliceLength: z.number().int().positive(),
          base: z.number().int(),
          renownThreshold: z.number().int(),
          renownDelta: z.number().int(),
          loudDelta: z.number().int(),
          quietDelta: z.number().int(),
        })
        .refine(v => v.length !== v.sliceLength, {
          path: ['sliceLength'],
          message: 'sliceLength must differ from full length to identify saved run mode',
        }),
      edgeTrust: z.number().int().min(0).max(3),
      edgeReward: z.number().int().positive(),
      trustedAssistBonus: z.number().int().nonnegative(),
    }),
  })
  .superRefine((rules, ctx) => {
    rules.shipModifiers.forEach((entry, i) =>
      entry.skills.forEach((skill, j) => {
        if (!Object.hasOwn(rules.skillChar, skill))
          ctx.addIssue({
            code: 'custom',
            path: ['shipModifiers', i, 'skills', j],
            message: `Unknown skill ${skill}; known: ${Object.keys(rules.skillChar).join(', ')}`,
          });
      }),
    );
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
    tags: z.array(
      z.string().refine(tag => (SHIP_TAGS as readonly string[]).includes(tag), { message: 'Unknown ship tag' }),
    ),
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

const SeasonRoleFields = { firstId: ContentId, finaleId: ContentId };
export const SeasonSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('unconfigured') }),
  z.strictObject({
    status: z.literal('configured'),
    /** Vertical-slice policy; full runs retain the legacy full-clock finale trigger. */
    pursuitFull: z.enum(['forceFinale', 'hardenFinale']).optional(),
    slice: z.strictObject({
      ...SeasonRoleFields,
      tutorialId: ContentId.optional(),
      middleIds: z.array(ContentId).length(2),
      minCompletedMiddle: z.literal(2),
    }),
    full: z
      .strictObject({
        ...SeasonRoleFields,
        middleIds: z.array(ContentId).length(3),
        conditionalId: ContentId,
        minCompletedMiddle: z.number().int().min(2).max(3),
      })
      .optional(),
  }),
]);
export type Season = z.infer<typeof SeasonSchema>;
