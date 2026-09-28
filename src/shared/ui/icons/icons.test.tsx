import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import iconsJson from '../../../../tools/icons/icons.json';

import * as icons from './index';

import type { IconProps } from './icon-props';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

const pascal = (name: string): string =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const entries = iconsJson.map((icon) => ({
  name: icon.name,
  component: `${pascal(icon.name)}Icon`,
  viewBox: icon.viewBox,
}));

const exported = Object.entries(icons).filter(([name]) => name.endsWith('Icon')) as [
  string,
  IconComponent,
][];

/** Renders an icon and returns its root <svg>. */
function renderSvg(Icon: IconComponent, props: IconProps = {}): SVGSVGElement {
  const { container } = render(<Icon {...props} />);
  const svg = container.querySelector('svg');
  if (svg === null) throw new Error('the icon rendered no <svg>');
  return svg;
}

describe('shared icons', () => {
  it('exports one component per icons.json entry', () => {
    expect(exported.map(([name]) => name).sort()).toEqual(entries.map((e) => e.component).sort());
  });

  it.each(entries)(
    '$component renders an svg with the recorded viewBox',
    ({ component, viewBox }) => {
      const Icon = (icons as unknown as Partial<Record<string, IconComponent>>)[component];
      if (Icon === undefined) throw new Error(`${component} is not exported from ./index`);
      const svg = renderSvg(Icon);
      expect(svg).toHaveAttribute('viewBox', viewBox);
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg.outerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    },
  );

  it('is decorative (aria-hidden) without a title', () => {
    const svg = renderSvg(icons.BellIcon);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg.querySelector('title')).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('renders role="img" named by its title when titled', () => {
    renderSvg(icons.BellIcon, { title: 'Notificaciones' });
    const img = screen.getByRole('img', { name: 'Notificaciones' });
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('applies size to width and height and passes other props through', () => {
    const svg = renderSvg(icons.HomeIcon, { size: 16, className: 'nav-icon' });
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveClass('nav-icon');
  });
});
