import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { YarbisInsightBanner } from './YarbisInsightBanner';

const INSIGHT_TEXT =
  'Detecté 3 cambios relevantes en el sector durante las últimas 24 horas: caída de margen en Shell, alza de producción en Chevron y una noticia crítica de ISA que bloquea 3 indicadores.';

vi.mock('@/shared/i18n', () => ({
  useT: () => {
    const translations: Record<string, string> = {
      'home.yarbisInsightBanner.prefix': 'Yarbis',
    };
    return (key: string) => translations[key] ?? key;
  },
}));

describe('YarbisInsightBanner', () => {
  it('"Yarbis:" renders in a <strong>', () => {
    render(<YarbisInsightBanner text={INSIGHT_TEXT} />);
    expect(screen.getByText('Yarbis')).toBeInTheDocument();
    expect(screen.getByRole('strong')).toBeInTheDocument();
  });

  it('the text prop renders', () => {
    render(<YarbisInsightBanner text={INSIGHT_TEXT} />);
    expect(screen.getByText(INSIGHT_TEXT)).toBeInTheDocument();
  });

  it('uses the card radius token and the prototype padding (L249; "rounded-12" made no CSS)', () => {
    render(<YarbisInsightBanner text={INSIGHT_TEXT} />);
    const banner = screen.getByTestId('yarbis-insight-banner');
    expect(banner).toHaveClass('rounded-card', 'px-18', 'py-14', 'gap-12');
    expect(banner).not.toHaveClass('rounded-12');
    expect(screen.getByText(INSIGHT_TEXT)).toHaveClass('text-text-on-dark-banner');
  });

  it('the sparkle is aria-hidden', () => {
    render(<YarbisInsightBanner text={INSIGHT_TEXT} />);
    const sparkle = screen.getByText('✦');
    expect(sparkle).toHaveAttribute('aria-hidden', 'true');
  });
});
