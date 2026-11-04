export function inspect(item: { name: string; svg: string }): string[];
export function palette(hex: string, name: string): boolean;
export function focal(pixels: Uint8Array | number[], width?: number): string | null;
export function setBudget(items: { svg: string }[]): string[];
export function unsafe(item: { name: string; svg: string }): boolean;
export function parseResult(output: string, count: number): (string | null)[];
