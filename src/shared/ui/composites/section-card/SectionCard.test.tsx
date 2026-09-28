import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Eyebrow } from './Eyebrow';
import { InfoGroup } from './info-group';
import { SectionCard } from './SectionCard';

const REPORT = 'Resumen del informe';
const FINDINGS = 'Hallazgos de IA';
const REPORT_INFO = 'Tabla en el formato del informe ejecutivo actual.';
const FINDINGS_INFO = 'Observaciones generadas por Yarbis.';

/** The card <section>, named by its title (its info panel is "Más información <title>"). */
const card = (name: string) => screen.getByRole('region', { name });
const panelOf = (name: string) => screen.getByRole('region', { name: `Más información ${name}` });
const toggleOf = (name: string) =>
  within(card(name)).getByRole('button', { name: 'Más información' });

describe('SectionCard', () => {
  it('renders a section named by its title with eyebrow, subtitle, actions and content', () => {
    render(
      <SectionCard
        title={REPORT}
        eyebrow="Informe"
        subtitle="Categoría, KPI, Valor GE"
        actions={<button type="button">{'Excel'}</button>}
      >
        {'Contenido'}
      </SectionCard>,
    );
    const section = card(REPORT);
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveClass('rounded-card', 'border-border-default', 'bg-surface-card');
    expect(within(section).getByRole('heading', { level: 3, name: REPORT })).toBeInTheDocument();
    expect(within(section).getByText('Informe')).toHaveClass('uppercase', 'text-eyebrow');
    expect(within(section).getByText('Categoría, KPI, Valor GE')).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: 'Excel' })).toBeInTheDocument();
    expect(within(section).getByText('Contenido')).toBeInTheDocument();
    expect(within(section).queryByRole('button', { name: 'Más información' })).toBeNull();
  });

  it('uses the prototype spacing token when requested by a screen surface', () => {
    render(<SectionCard title={REPORT} padding="prototype" />);
    expect(card(REPORT)).toHaveClass('p-(--spacing-22)');
    expect(card(REPORT)).not.toHaveClass('p-20');
  });

  it('titleVariant="eyebrow" + surface="none": an uppercase group label on the page (SCR-05 L255)', () => {
    render(
      <SectionCard
        title={REPORT}
        titleVariant="eyebrow"
        surface="none"
        headingLevel={2}
        info="Detalle"
        actions={<button type="button">{'Ver todos'}</button>}
      >
        {'Contenido'}
      </SectionCard>,
    );
    const section = card(REPORT);
    expect(section).not.toHaveClass('rounded-card', 'border', 'bg-surface-card', 'p-20');
    const heading = within(section).getByRole('heading', { level: 2, name: REPORT });
    expect(heading).toHaveClass('uppercase', 'text-eyebrow', 'tracking-eyebrow');
    expect(heading).not.toHaveClass('text-title-card');
    expect(within(section).getByRole('button', { name: 'Más información' })).toBeInTheDocument();
    expect(within(section).getByText('Contenido')).toHaveClass('mt-12');
    expect(section.querySelector('header')).toHaveClass('items-center');
  });

  it('wires the info toggle to a hidden, labelled region through aria-expanded / aria-controls', async () => {
    const user = userEvent.setup();
    render(<SectionCard title={REPORT} info={REPORT_INFO} />);
    const toggle = toggleOf(REPORT);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAccessibleDescription(REPORT);
    const panelId = toggle.getAttribute('aria-controls') ?? '';
    const panel = document.getElementById(panelId);
    expect(panel).not.toBeNull();
    expect(panel).not.toBeVisible();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(panelOf(REPORT)).toBe(panel);
    expect(panel).toBeVisible();
    expect(panel).toHaveTextContent(REPORT_INFO);
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toBeVisible();
  });

  it('closes the panel on Escape and returns focus to its toggle', async () => {
    const user = userEvent.setup();
    render(
      <SectionCard title={REPORT} info={<a href="#fuente">{'Fuente'}</a>}>
        {'Contenido'}
      </SectionCard>,
    );
    const toggle = toggleOf(REPORT);
    await user.click(toggle);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Fuente' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('supports controlled and uncontrolled panels', async () => {
    const user = userEvent.setup();
    const onInfoOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <SectionCard
          title={FINDINGS}
          info={FINDINGS_INFO}
          infoOpen={open}
          onInfoOpenChange={(next) => {
            onInfoOpenChange(next);
            setOpen(next);
          }}
        />
      );
    }
    render(
      <>
        <Controlled />
        <SectionCard title={REPORT} info={REPORT_INFO} defaultInfoOpen />
      </>,
    );
    expect(toggleOf(FINDINGS)).toHaveAttribute('aria-expanded', 'true');
    expect(toggleOf(REPORT)).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggleOf(FINDINGS));
    expect(onInfoOpenChange).toHaveBeenCalledTimes(1);
    expect(onInfoOpenChange).toHaveBeenLastCalledWith(false);
    expect(toggleOf(FINDINGS)).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('InfoGroup', () => {
  it('keeps a single panel open inside a group and reports the one it closes', async () => {
    const user = userEvent.setup();
    const onReportChange = vi.fn();
    render(
      <InfoGroup>
        <SectionCard title={REPORT} info={REPORT_INFO} onInfoOpenChange={onReportChange} />
        <SectionCard title={FINDINGS} info={FINDINGS_INFO} />
      </InfoGroup>,
    );
    await user.click(toggleOf(REPORT));
    expect(toggleOf(REPORT)).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggleOf(FINDINGS));
    expect(toggleOf(FINDINGS)).toHaveAttribute('aria-expanded', 'true');
    expect(toggleOf(REPORT)).toHaveAttribute('aria-expanded', 'false');
    expect(onReportChange).toHaveBeenLastCalledWith(false);
    await user.click(toggleOf(FINDINGS));
    expect(toggleOf(FINDINGS)).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps separate groups independent', async () => {
    const user = userEvent.setup();
    render(
      <>
        <InfoGroup>
          <SectionCard title={REPORT} info={REPORT_INFO} />
        </InfoGroup>
        <InfoGroup>
          <SectionCard title={FINDINGS} info={FINDINGS_INFO} />
        </InfoGroup>
      </>,
    );
    await user.click(toggleOf(REPORT));
    await user.click(toggleOf(FINDINGS));
    expect(toggleOf(REPORT)).toHaveAttribute('aria-expanded', 'true');
    expect(toggleOf(FINDINGS)).toHaveAttribute('aria-expanded', 'true');
  });

  it('can be controlled by card id', async () => {
    const user = userEvent.setup();
    const onOpenIdChange = vi.fn();
    render(
      <InfoGroup openId="findings" onOpenIdChange={onOpenIdChange}>
        <SectionCard infoId="report" title={REPORT} info={REPORT_INFO} />
        <SectionCard infoId="findings" title={FINDINGS} info={FINDINGS_INFO} />
      </InfoGroup>,
    );
    expect(toggleOf(FINDINGS)).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggleOf(REPORT));
    expect(onOpenIdChange).toHaveBeenLastCalledWith('report');
  });
});

describe('Eyebrow', () => {
  it('renders the uppercase eyebrow as the requested element', () => {
    render(<Eyebrow as="h2">{FINDINGS}</Eyebrow>);
    expect(screen.getByRole('heading', { level: 2, name: FINDINGS })).toHaveClass('uppercase');
  });
});
