// CSF3 stories, one per catalogue variant plus the two group modes. Storybook (P2-W04b) is not installed yet, so the
// objects are untyped; add `satisfies Meta<typeof Chip>` / `StoryObj<typeof meta>` from '@storybook/react-vite' when it
// lands. Labels are sample copy from docs/design/component-catalog.md "### Chip" / "### ChipGroup".
import { Chip } from './Chip';
import { FilterChipGroup } from './ChipGroup';

const meta = {
  title: 'Primitives/Chip',
  component: Chip,
};

export default meta;

const noop = () => undefined;

export const Static = { args: { variant: 'static', children: 'Capital IQ · principal' } };
export const Choice = { args: { variant: 'choice', selected: false, children: 'Estratégico ILP' } };
export const ChoiceSelected = {
  args: { variant: 'choice', selected: true, children: 'Estratégico TBG' },
};
export const Toggle = { args: { variant: 'toggle', selected: false, children: 'Liquidez' } };
export const Soft = {
  args: { variant: 'soft', selected: false, children: 'Tabla de indicadores' },
};
export const SoftSelected = {
  args: { variant: 'soft', selected: true, children: 'Barras GE vs. pares' },
};
export const ToggleSelected = {
  args: { variant: 'toggle', selected: true, children: 'Rentabilidad' },
};
export const Filter = {
  args: { variant: 'filter', onRemove: noop, removeLabel: 'Quitar', children: 'Publicado' },
};
export const Suggestion = {
  args: { variant: 'suggestion', children: '¿Qué análisis tengo pendiente?' },
};
export const Estimate = { args: { variant: 'estimate', selected: false, children: 'Real' } };
export const EstimateSelected = {
  args: { variant: 'estimate', selected: true, children: 'Estimado' },
};
export const Segment = {
  args: { variant: 'segment', size: 'toggle', selected: false, children: 'Atención' },
};
export const SegmentSelected = {
  args: { variant: 'segment', size: 'toggle', selected: true, children: 'Atención' },
};
export const Option = {
  args: { variant: 'option', size: 'option', selected: false, children: 'Estratégico ILP' },
};
export const OptionSelected = {
  args: { variant: 'option', size: 'option', selected: true, children: 'Estratégico TBG' },
};
export const Indicator = { args: { variant: 'indicator', code: 'PAR-01', children: 'ROACE' } };
export const Dashed = { args: { variant: 'dashed', children: '+ Nuevo perfil' } };
export const Small = { args: { variant: 'static', size: 'sm', children: 'Bloomberg' } };

const severities = [
  { id: 'info', label: 'Info' },
  { id: 'success', label: 'OK' },
  { id: 'warn', label: 'Atención' },
  { id: 'error', label: 'Crítico' },
];

export const GroupMulti = {
  render: () => (
    <FilterChipGroup
      items={severities}
      mode="multi"
      value={['info', 'warn']}
      onChange={noop}
      aria-label="Severidad"
    />
  ),
};

export const GroupSingle = {
  render: () => (
    <FilterChipGroup
      items={severities}
      mode="single"
      value={['success']}
      onChange={noop}
      aria-label="Severidad"
    />
  ),
};
