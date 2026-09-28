// CSF3 stories, one per catalogue variant. Storybook (P2-W04b) is not installed yet, so the objects are untyped; add
// `satisfies Meta<typeof Badge>` / `StoryObj<typeof meta>` from '@storybook/react-vite' when it lands.
// Labels are sample copy from docs/design/component-catalog.md "### Badge".
import { Badge } from './Badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
};

export default meta;

export const StatusDraft = { args: { kind: 'status', status: 'draft', children: 'Borrador' } };
export const StatusInProgress = {
  args: { kind: 'status', status: 'in_progress', children: 'En construcción' },
};
export const StatusInReview = {
  args: { kind: 'status', status: 'in_review', children: 'En revisión' },
};
export const StatusPublished = {
  args: { kind: 'status', status: 'published', children: 'Publicado' },
};
export const CoverageComplete = {
  args: { kind: 'coverage', coverage: 'complete', children: 'Completa' },
};
export const CoveragePartial = {
  args: { kind: 'coverage', coverage: 'partial', children: 'Requiere revisión' },
};
export const CoverageMissing = {
  args: { kind: 'coverage', coverage: 'missing', children: 'Faltante' },
};
export const SeverityInfo = { args: { kind: 'severity', severity: 'info', children: 'Info' } };
export const SeveritySuccess = { args: { kind: 'severity', severity: 'success', children: 'OK' } };
export const SeverityWarn = { args: { kind: 'severity', severity: 'warn', children: 'Atención' } };
export const SeverityError = { args: { kind: 'severity', severity: 'error', children: 'Crítico' } };
export const Tier1 = { args: { kind: 'tier', tier: 1, children: 'Líder' } };
export const Tier2 = { args: { kind: 'tier', tier: 2, children: 'Estratégico' } };
export const Tier3 = { args: { kind: 'tier', tier: 3, children: 'Seguimiento' } };
export const Tier4 = { args: { kind: 'tier', tier: 4, children: 'Prioritario' } };
export const UrgencyHigh = { args: { kind: 'urgency', urgency: 'high', children: 'Alta' } };
export const UrgencyMedium = { args: { kind: 'urgency', urgency: 'medium', children: 'Media' } };
export const CommentPending = {
  args: { kind: 'commentStatus', commentStatus: 'pending', children: 'Pendiente' },
};
export const CommentInAnalysis = {
  args: { kind: 'commentStatus', commentStatus: 'in_analysis', children: 'En análisis' },
};
export const CommentResolved = {
  args: { kind: 'commentStatus', commentStatus: 'resolved', children: 'Resuelto' },
};
export const HorizonTbg = { args: { kind: 'horizon', horizon: 'tbg', children: 'TBG' } };
export const HorizonIlp = { args: { kind: 'horizon', horizon: 'ilp', children: 'ILP' } };
export const DeltaUp = { args: { kind: 'delta', trend: 'up', children: '+3,2%' } };
export const DeltaDown = { args: { kind: 'delta', trend: 'down', children: '-27,5%' } };
export const Tbd = { args: { kind: 'tbd', children: 'TBD' } };
export const Count = { args: { kind: 'count', children: '11' } };
export const CountBrand = {
  args: { kind: 'count', countTone: 'brand', children: '7 diapositivas' },
};
export const CountNeutral = { args: { kind: 'count', countTone: 'neutral', children: '1' } };
export const Code = { args: { kind: 'code', children: 'IND-ROACE' } };
export const Highlight = { args: { kind: 'highlight', children: 'Ecopetrol' } };
export const Soon = { args: { kind: 'soon', children: 'Próximamente' } };

/** Every tone side by side at the micro size (CF-141: each text colour reaches 4.5:1 on its fill). */
export const AllTones = {
  render: () => (
    <div className="flex max-w-160 flex-wrap gap-8">
      <Badge kind="severity" severity="info">
        {'Info'}
      </Badge>
      <Badge kind="severity" severity="success">
        {'OK'}
      </Badge>
      <Badge kind="severity" severity="warn">
        {'Atención'}
      </Badge>
      <Badge kind="severity" severity="error">
        {'Crítico'}
      </Badge>
      <Badge kind="tier" tier={1}>
        {'Líder'}
      </Badge>
      <Badge kind="tier" tier={4}>
        {'Prioritario'}
      </Badge>
      <Badge kind="commentStatus" commentStatus="pending">
        {'Pendiente'}
      </Badge>
      <Badge kind="commentStatus" commentStatus="in_analysis">
        {'En análisis'}
      </Badge>
      <Badge kind="commentStatus" commentStatus="resolved">
        {'Resuelto'}
      </Badge>
      <Badge kind="horizon" horizon="tbg">
        {'TBG'}
      </Badge>
      <Badge kind="tbd">{'TBD'}</Badge>
      <Badge kind="count">{'11'}</Badge>
    </div>
  ),
};
