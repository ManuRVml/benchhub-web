// Asserts that the committed theme.css exposes every colour token of design-tokens.json as a CSS variable with the
// resolved hex value (references followed to their literal), that the committed generated files match the source,
// and that Tailwind's default palette is reset.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { buildScales, buildTheme, collectTokens, createResolver } from './build-theme.mjs';

const tokens = JSON.parse(readFileSync('docs/design/design-tokens.json', 'utf8'));
const css = readFileSync('src/app/styles/theme.css', 'utf8');
const theme = css.slice(css.indexOf('@theme {'), css.indexOf('\n}\n'));
const entries = collectTokens(tokens);
const { resolvePath } = createResolver(entries);
const colors = entries.filter(({ token }) => token.$type === 'color');

const kebab = (segment) => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

describe('theme.css', () => {
  it('covers the colour tokens', () => {
    expect(colors.length).toBeGreaterThan(150);
  });

  it.each(colors.map(({ path }) => [path.join('.')]))(
    '%s has its --color-* variable with the resolved hex',
    (path) => {
      const name = `--color-${path.split('.').map(kebab).join('-')}`;
      const hex = resolvePath(path);
      expect(hex).toMatch(/^#[0-9A-F]{6}([0-9A-F]{2})?$/i);
      expect(theme).toContain(`  ${name}: ${hex};`);
    },
  );

  it('is in sync with design-tokens.json (the in-process pnpm tokens:check)', () => {
    expect(css).toBe(buildTheme(tokens));
    expect(readFileSync('src/shared/lib/tailwind-theme.generated.ts', 'utf8')).toBe(
      buildScales(tokens),
    );
  });

  // Fidelity audits SCR-11/15/16: the prototype values they need exist as tokens (no new token was required).
  it.each([
    ['  --spacing-18: 18px;'],
    ['  --spacing-22: 22px;'],
    ['  --size-layout-max-width-config: 560px;'],
    ['  --size-layout-max-width-notificaciones: 760px;'],
    ['  --size-layout-max-width-monitor: 840px;'],
    ['  --color-status-success-base: #10B981;'],
  ])('exposes the audited token %s', (line) => {
    expect(css).toContain(line);
  });

  it('resets the Tailwind default palette so tokens are the only colours', () => {
    expect(theme).toContain('--color-*: initial;');
    expect(theme).not.toMatch(/--color-(red|blue|slate|gray|zinc)-\d/);
  });
});
