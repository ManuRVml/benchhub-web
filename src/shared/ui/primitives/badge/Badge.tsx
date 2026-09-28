import { cn } from '@/shared/lib';

import { badgeVariants } from './badge-variants';

import type { BadgeSize, BadgeTone } from './badge-variants';
import type { ComponentProps } from 'react';

/** Analysis lifecycle status (V-04 / V-03 `status`). */
export type AnalysisStatus = 'draft' | 'in_progress' | 'in_review' | 'published';
/** Company data coverage (SCR-08): complete ≥ 90 %, partial 70–89 %, missing < 70 %. */
export type CoverageStatus = 'complete' | 'partial' | 'missing';
export type Severity = 'info' | 'success' | 'warn' | 'error';
export type Tier = 1 | 2 | 3 | 4;
export type Urgency = 'high' | 'medium';
/** Review comment status (V-26 / C-10 / C-11, English per CF-101). */
export type CommentStatus = 'pending' | 'in_analysis' | 'resolved';
export type Horizon = 'tbg' | 'ilp';
export type DeltaTrend = 'up' | 'down' | 'flat';

/** What the badge shows; each kind carries the value that picks its tone. */
export type BadgeKind =
  | { kind: 'status'; status: AnalysisStatus }
  | { kind: 'coverage'; coverage: CoverageStatus }
  | { kind: 'severity'; severity: Severity }
  | { kind: 'tier'; tier: Tier }
  | { kind: 'urgency'; urgency: Urgency }
  | { kind: 'commentStatus'; commentStatus: CommentStatus }
  | { kind: 'horizon'; horizon: Horizon }
  | { kind: 'delta'; trend: DeltaTrend }
  | { kind: 'tbd' }
  /**
   * `countTone`: `alert` (default) is the red notification count; `brand` the brand-light pill ("7 diapositivas",
   * SCR-13 HTML L2453); `neutral` the grey count pill ("Comentarios 1", HTML L2563). Only `alert` uses the round
   * `count` size.
   */
  | { kind: 'count'; countTone?: 'alert' | 'brand' | 'neutral' }
  | { kind: 'code' }
  | { kind: 'highlight' }
  | { kind: 'soon' };

const STATUS_TONE: Record<AnalysisStatus, BadgeTone> = {
  draft: 'neutral',
  in_progress: 'progress',
  in_review: 'warning',
  published: 'success',
};
const COVERAGE_TONE: Record<CoverageStatus, BadgeTone> = {
  complete: 'success',
  partial: 'warning',
  missing: 'danger',
};
const SEVERITY_TONE: Record<Severity, BadgeTone> = {
  info: 'severityInfo',
  success: 'severitySuccess',
  warn: 'severityWarn',
  error: 'severityError',
};
const TIER_TONE: Record<Tier, BadgeTone> = { 1: 'tier1', 2: 'tier2', 3: 'tier3', 4: 'tier4' };
const URGENCY_TONE: Record<Urgency, BadgeTone> = { high: 'urgencyHigh', medium: 'urgencyMedium' };
const COMMENT_TONE: Record<CommentStatus, BadgeTone> = {
  pending: 'warning',
  in_analysis: 'severityInfo',
  resolved: 'success',
};
const HORIZON_TONE: Record<Horizon, BadgeTone> = { tbg: 'horizonTbg', ilp: 'horizonIlp' };
const DELTA_TONE: Record<DeltaTrend, BadgeTone> = {
  up: 'success',
  down: 'danger',
  flat: 'neutral',
};

/** Tone and `data-variant` value of a badge kind. */
export function badgeAppearance(props: BadgeKind): { tone: BadgeTone; variant: string } {
  switch (props.kind) {
    case 'status':
      return { tone: STATUS_TONE[props.status], variant: `status-${props.status}` };
    case 'coverage':
      return { tone: COVERAGE_TONE[props.coverage], variant: `coverage-${props.coverage}` };
    case 'severity':
      return { tone: SEVERITY_TONE[props.severity], variant: `severity-${props.severity}` };
    case 'tier':
      return { tone: TIER_TONE[props.tier], variant: `tier-${String(props.tier)}` };
    case 'urgency':
      return { tone: URGENCY_TONE[props.urgency], variant: `urgency-${props.urgency}` };
    case 'commentStatus':
      return {
        tone: COMMENT_TONE[props.commentStatus],
        variant: `comment-status-${props.commentStatus}`,
      };
    case 'horizon':
      return { tone: HORIZON_TONE[props.horizon], variant: `horizon-${props.horizon}` };
    case 'delta':
      return { tone: DELTA_TONE[props.trend], variant: `delta-${props.trend}` };
    case 'tbd':
      return { tone: 'muted', variant: 'tbd' };
    case 'count':
      switch (props.countTone) {
        case 'brand':
          return { tone: 'brandSubtle', variant: 'count-brand' };
        case 'neutral':
          return { tone: 'neutral', variant: 'count-neutral' };
        default:
          return { tone: 'count', variant: 'count' };
      }
    case 'code':
      return { tone: 'code', variant: 'code' };
    case 'highlight':
      return { tone: 'highlight', variant: 'highlight' };
    case 'soon':
      return { tone: 'neutral', variant: 'soon' };
  }
}

export type BadgeProps = BadgeKind &
  Omit<ComponentProps<'span'>, 'children'> & {
    /** Visible text, already translated by the caller (never a literal inside the component). */
    children?: ComponentProps<'span'>['children'];
    size?: BadgeSize;
  };

/**
 * Non-interactive status / count / code pill (catalogue "Badge"; aliases StatusChip, TierChip, SeverityTag,
 * CommentStatusChip, HorizonBadge, CountBadge, CodeTag, DeltaPill, EcopetrolChip). Colour is never the only signal:
 * callers always pass the text. Extends native `<span>` props, `ref` included (React 19 ref-as-prop, the successor of
 * forwardRef); `data-testid` is configurable through the native props (build it with `badgeTestId`).
 */
export function Badge(props: BadgeProps) {
  const { size, className, children, ...rest } = props;
  const { tone, variant } = badgeAppearance(props);
  const native = omitKindProps(rest);
  return (
    <span
      {...native}
      data-variant={variant}
      className={cn(
        badgeVariants({ tone, size: size ?? (variant === 'count' ? 'count' : 'sm') }),
        className,
      )}
    >
      {children}
    </span>
  );
}

const KIND_KEYS = [
  'kind',
  'status',
  'coverage',
  'severity',
  'tier',
  'urgency',
  'commentStatus',
  'horizon',
  'trend',
  'countTone',
] as const;

/** Removes the variant props so they never reach the DOM as unknown attributes. */
function omitKindProps(props: object): Omit<ComponentProps<'span'>, 'children'> {
  const kindKeys: readonly string[] = KIND_KEYS;
  return Object.fromEntries(
    Object.entries(props as Record<string, unknown>).filter(([key]) => !kindKeys.includes(key)),
  );
}
