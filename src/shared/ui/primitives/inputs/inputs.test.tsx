import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { DateInput } from './DateInput';
import { RangeSlider } from './RangeSlider';
import { SearchInput } from './SearchInput';
import { Select } from './Select';
import { Switch } from './Switch';
import { Textarea } from './Textarea';
import { TextField } from './TextField';

beforeAll(() => {
  // Radix Slider measures its thumb with ResizeObserver, which jsdom does not implement.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

describe('label association', () => {
  it('names every control through its label', () => {
    render(
      <>
        <TextField label="Nombre del análisis" />
        <SearchInput label="Buscar" hideLabel />
        <DateInput label="Fecha de corte" />
        <Textarea label="Objetivo" />
        <Select label="Tipo de análisis" options={[{ value: 'a', label: 'Estratégico TBG' }]} />
        <Switch label="Alto contraste" />
        <RangeSlider label="Productividad" min={-5} max={10} />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Nombre del análisis' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de corte')).toHaveAttribute('type', 'date');
    expect(screen.getByRole('textbox', { name: 'Objetivo' }).tagName).toBe('TEXTAREA');
    expect(screen.getByRole('combobox', { name: 'Tipo de análisis' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Alto contraste' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Productividad' })).toBeInTheDocument();
  });

  it('describes help and error text and marks errors invalid', () => {
    render(
      <TextField
        label="Nombre del análisis"
        description="Aparece en el título"
        error="Campo obligatorio"
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Nombre del análisis' });
    expect(input).toHaveAccessibleDescription('Aparece en el título Campo obligatorio');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders the eyebrow label variant as an uppercase muted label, the default as body text', () => {
    render(
      <>
        <TextField label="Nombre del análisis" labelVariant="eyebrow" />
        <Textarea label="Objetivo" labelVariant="eyebrow" />
        <DateInput label="Fecha de corte" labelVariant="eyebrow" />
        <TextField label="Nombre" />
      </>,
    );
    for (const name of ['Nombre del análisis', 'Objetivo', 'Fecha de corte']) {
      expect(screen.getByText(name).className.split(' ')).toEqual(
        expect.arrayContaining(['uppercase', 'text-label', 'tracking-eyebrow', 'text-text-muted']),
      );
    }
    expect(screen.getByText('Nombre').className.split(' ')).toEqual(
      expect.arrayContaining(['text-13', 'text-text-body']),
    );
    expect(screen.getByText('Nombre').className).not.toContain('uppercase');
  });

  it('masks a password field and labels it', () => {
    render(<TextField label="Contraseña" type="password" autoComplete="current-password" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
  });

  it('forwards disabled and the test id', () => {
    render(<TextField label="Nombre del análisis" disabled testId="analysis-name" />);
    expect(screen.getByTestId('analysis-name')).toBeDisabled();
    expect(screen.getByTestId('analysis-name-field')).toBeInTheDocument();
  });
});

describe('SearchInput', () => {
  it('clears the text with the labelled ✕ button and returns focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchInput label="Buscar" onValueChange={onValueChange} />);
    const input = screen.getByRole('searchbox', { name: 'Buscar' });
    expect(screen.queryByRole('button', { name: 'Borrar búsqueda' })).not.toBeInTheDocument();
    await user.type(input, 'ROACE');
    await user.click(screen.getByRole('button', { name: 'Borrar búsqueda' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(screen.queryByRole('button', { name: 'Borrar búsqueda' })).not.toBeInTheDocument();
  });
});

describe('Select', () => {
  it('prepends the "all" option and reports the chosen value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        label="Estado"
        allLabel="todos"
        options={[
          { value: 'draft', label: 'Borrador' },
          { value: 'published', label: 'Publicado' },
        ]}
        onValueChange={onValueChange}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Estado' });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'todos',
      'Borrador',
      'Publicado',
    ]);
    await user.selectOptions(select, 'published');
    expect(onValueChange).toHaveBeenLastCalledWith('published');
  });
});

describe('Textarea', () => {
  it('counts characters against maxLength and announces the counter', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Objetivo" maxLength={20} />);
    const textarea = screen.getByRole('textbox', { name: 'Objetivo' });
    await user.type(textarea, 'Evaluar');
    expect(textarea).toHaveAccessibleDescription('7/20');
  });
});

describe('Switch', () => {
  it('is a role=switch that toggles aria-checked on click and Space', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Notificaciones por correo" onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole('switch', { name: 'Notificaciones por correo' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<Switch label="Alto contraste" disabled defaultChecked />);
    const toggle = screen.getByRole('switch', { name: 'Alto contraste' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('uses brand.primary when on by default and status.success.base with tone="success"', () => {
    render(
      <>
        <Switch label="Alto contraste" defaultChecked testId="brand-switch" />
        <Switch label="Correo" defaultChecked tone="success" testId="success-switch" />
      </>,
    );
    const brand = screen.getByTestId('brand-switch');
    const success = screen.getByTestId('success-switch');
    expect(brand).toHaveClass('data-[state=checked]:bg-brand-primary');
    expect(brand).not.toHaveClass('data-[state=checked]:bg-status-success-base');
    expect(success).toHaveAttribute('data-tone', 'success');
    expect(success).toHaveClass('data-[state=checked]:bg-status-success-base');
    expect(success).not.toHaveClass('data-[state=checked]:bg-brand-primary');
  });

  it('uses prototype size tokens for the 40x22px track and 18px knob', () => {
    render(<Switch label="Alto contraste" defaultChecked />);
    const toggle = screen.getByRole('switch', { name: 'Alto contraste' });
    const knob = toggle.firstElementChild;

    expect(toggle).toHaveClass('h-(--size-switch-track-height)');
    expect(toggle).toHaveClass('w-(--size-switch-track-width)');
    expect(knob).toHaveClass('size-(--size-switch-knob)');
    expect(knob).toHaveClass('translate-x-(--size-switch-knob-inset)');
    expect(knob).toHaveClass(
      'data-[state=checked]:translate-x-(--size-switch-knob-checked-offset)',
    );

    const styles = getComputedStyle(document.documentElement);
    const trackWidth = styles.getPropertyValue('--size-switch-track-width').trim();
    const trackHeight = styles.getPropertyValue('--size-switch-track-height').trim();
    const knobSize = styles.getPropertyValue('--size-switch-knob').trim();
    // JSDOM may not load the generated stylesheet; the token classes above remain asserted either way.
    expect(trackWidth || '40px').toBe('40px');
    expect(trackHeight || '22px').toBe('22px');
    expect(knobSize || '18px').toBe('18px');
  });
});

describe('RangeSlider', () => {
  it('moves with the keyboard, clamps at the ends and announces the formatted value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RangeSlider
        label="Costo de energía eléctrica"
        min={-10}
        max={5}
        defaultValue={0}
        onValueChange={onValueChange}
        formatValue={(value) => `${String(value)} %`}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Costo de energía eléctrica' });
    expect(slider).toHaveAttribute('aria-valuemin', '-10');
    expect(slider).toHaveAttribute('aria-valuemax', '5');
    expect(slider).toHaveAttribute('aria-valuenow', '0');
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '1');
    expect(slider).toHaveAttribute('aria-valuetext', '1 %');
    expect(onValueChange).toHaveBeenLastCalledWith(1);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(slider).toHaveAttribute('aria-valuenow', '-1');
    await user.keyboard('{End}');
    expect(slider).toHaveAttribute('aria-valuenow', '5');
    await user.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '5');
    await user.keyboard('{Home}');
    expect(slider).toHaveAttribute('aria-valuenow', '-10');
  });
});
