/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { badgeVariants } from './badge-variants';

import type { BadgeTone } from './badge-variants';

// WCAG AA for every Badge tone (CF-141): badges render micro text (10–11px), so text on fill needs 4.5:1. Colours are
// read from the generated theme, so a tone that points at a lighter token fails here.
// Read from disk: vitest serves CSS modules (also `?raw`) as empty strings.
// (jsdom makes import.meta.url non-file, so the path is taken from the project root vitest runs in).
const theme = readFileSync(join(process.cwd(), 'src', 'app', 'styles', 'theme.css'), 'utf8');
const variantsSource = Object.values(
  import.meta.glob<string>('./badge-variants.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
)[0];

function color(name: string): string {
  const match = new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(theme);
  if (!match?.[1]) throw new Error(`no --color-${name} in theme.css`);
  return match[1];
}

function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** Every tone declared in badge-variants.ts (read from the source, so a new tone is checked too). */
const TONES = [
  ...(variantsSource ?? '')
    .slice((variantsSource ?? '').indexOf('tone: {'), (variantsSource ?? '').indexOf('size: {'))
    .matchAll(/^\s+(\w+): '/gm),
].map((match) => match[1] as BadgeTone);

function colours(tone: BadgeTone): { fill: string; text: string } {
  const classes = badgeVariants({ tone }).split(' ');
  const fill = classes.find((name) => name.startsWith('bg-'))?.slice(3);
  const text = classes
    .find((name) => name.startsWith('text-') && !/^text-(micro|\d)/.test(name))
    ?.slice(5);
  if (!fill || !text) throw new Error(`tone ${tone} has no fill or text colour`);
  return { fill, text };
}

describe('Badge tone contrast', () => {
  it('reads every tone', () => {
    expect(TONES.length).toBeGreaterThanOrEqual(20);
  });

  it.each(TONES)('%s text reaches 4.5:1 on its fill', (tone) => {
    const { fill, text } = colours(tone);
    expect(contrast(color(text), color(fill))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['severityInfo', 'severity-info-bg', 'brand-indigo'],
    ['severitySuccess', 'severity-success-bg', 'status-success-text'],
    ['severityWarn', 'severity-warn-bg', 'status-warning-text'],
    ['severityError', 'severity-error-bg', 'status-danger-text'],
  ] as const)('%s keeps the prototype fill and uses the AA text token', (tone, fill, text) => {
    expect(colours(tone)).toEqual({ fill, text });
  });
});
