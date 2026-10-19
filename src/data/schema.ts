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
    }),
  ),
  bonuses: z.record(z.string(), z.object({ label: z.string(), n: z.number().int() })),
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
  }),
);

export const ShipsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    main: z.boolean(),
  }),
);

export type Rules = z.infer<typeof RulesSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Crew = z.infer<typeof CrewSchema>;
export type Ships = z.infer<typeof ShipsSchema>;
export type Characteristic = z.infer<typeof Characteristic>;
