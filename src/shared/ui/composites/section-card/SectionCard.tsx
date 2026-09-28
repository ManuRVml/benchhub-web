import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/shared/lib';

import { Eyebrow } from './Eyebrow';
import { useInfoGroup } from './info-group';
import { InfoToggle } from './InfoToggle';
import { InlineInfoPanel } from './InlineInfoPanel';

import type { ReactNode } from 'react';

export interface SectionCardProps {
  /** Card title, rendered as a heading that also names the card and its info panel. */
  title: ReactNode;
  /** Uppercase label above the title (e.g. "Hallazgos de IA"). */
  eyebrow?: ReactNode;
  /** Muted line under the title. */
  subtitle?: ReactNode;
  /** Right-hand header slot: link, pill, pager, button. */
  actions?: ReactNode;
  /** Content of the "(i)" info panel; when given, the header shows the info toggle. */
  info?: ReactNode;
  /** Controlled info panel state (outside an `InfoGroup`; inside one the group owns it). */
  infoOpen?: boolean;
  /** Uncontrolled initial info panel state (outside an `InfoGroup`). */
  defaultInfoOpen?: boolean;
  /** Called whenever the info panel opens or closes, also when a group closes it. */
  onInfoOpenChange?: (open: boolean) => void;
  /** Stable id of the card inside its `InfoGroup` (default: generated). */
  infoId?: string;
  /**
   * `title` (default): 600 15px card title. `eyebrow`: the uppercase 11px group label of SCR-05 (prototype L256),
   * with the header centred on the info toggle and the content 12px below (component catalog SectionHeader `eyebrow`).
   */
  titleVariant?: 'title' | 'eyebrow';
  /** `card` (default): white bordered card, 20px padding. `none`: no surface, the header and content sit on the page. */
  surface?: 'card' | 'none';
  /** Heading level of the title in the page outline (default 3). */
  headingLevel?: 2 | 3 | 4;
  /** `prototype` uses the shared 22px spacing token for screens whose source card uses 22px padding. */
  padding?: 'default' | 'prototype';
  /** `data-testid` of the card; the toggle is `<testId>-info-toggle` and the panel `<testId>-info-panel`. */
  testId?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Static module card (component catalog "Card" `default` + "SectionHeader"): flat `surface.card` with a 1px
 * `border.default` and `radius.card` (synthesis L662), a header with eyebrow, title, subtitle, "(i)" toggle and actions,
 * the inline info panel under the header, then the content. Rendered as `<section aria-labelledby>` the title.
 * Escape inside the card closes an open info panel and returns focus to its toggle.
 */
export function SectionCard({
  title,
  eyebrow,
  subtitle,
  actions,
  info,
  infoOpen,
  defaultInfoOpen = false,
  onInfoOpenChange,
  infoId,
  titleVariant = 'title',
  surface = 'card',
  headingLevel = 3,
  padding = 'default',
  testId = 'section-card',
  className,
  children,
}: SectionCardProps) {
  const generated = useId();
  const id = infoId ?? generated;
  const titleId = `${generated}-title`;
  const panelId = `${generated}-info`;
  const toggleId = `${generated}-info-toggle`;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const group = useInfoGroup();
  const [localOpen, setLocalOpen] = useState(defaultInfoOpen);

  const controlled = !group && infoOpen !== undefined;
  const open = group ? group.openIds.has(id) : (infoOpen ?? localOpen);

  // Group and uncontrolled panels report every change, including a group closing this panel because another card
  // opened; a controlled card reports the request in setOpen and its parent owns `infoOpen`.
  const reported = useRef(open);
  useEffect(() => {
    if (controlled || reported.current === open) return;
    reported.current = open;
    onInfoOpenChange?.(open);
  }, [controlled, open, onInfoOpenChange]);

  const setOpen = (next: boolean) => {
    if (group) {
      if (next) group.open(id);
      else group.close(id);
      return;
    }
    if (controlled) onInfoOpenChange?.(next);
    else setLocalOpen(next);
  };

  // Escape anywhere inside the card closes its open panel and returns focus to the toggle. A native listener, because
  // the card is a non-interactive <section>.
  const sectionRef = useRef<HTMLElement>(null);
  const hasInfo = info !== undefined;
  const closeRef = useRef(setOpen);
  useEffect(() => {
    closeRef.current = setOpen;
  });
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !hasInfo || !open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      closeRef.current(false);
      toggleRef.current?.focus();
    };
    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
    };
  }, [hasInfo, open]);

  const Heading = `h${String(headingLevel)}` as 'h2' | 'h3' | 'h4';
  const eyebrowTitle = titleVariant === 'eyebrow';

  return (
    <section
      ref={sectionRef}
      aria-labelledby={titleId}
      data-testid={testId}
      className={cn(
        surface === 'card' &&
          cn(
            'rounded-card border border-border-default bg-surface-card',
            padding === 'prototype' ? 'p-(--spacing-22)' : 'p-20',
          ),
        className,
      )}
    >
      <header
        className={cn('flex justify-between gap-12', eyebrowTitle ? 'items-center' : 'items-start')}
      >
        <div className="min-w-0">
          {eyebrow === undefined ? null : <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
          <div className="flex items-center gap-6">
            <Heading
              id={titleId}
              className={
                eyebrowTitle
                  ? 'text-eyebrow tracking-eyebrow text-text-secondary uppercase'
                  : 'text-title-card text-text-heading'
              }
            >
              {title}
            </Heading>
            {hasInfo ? (
              <InfoToggle
                ref={toggleRef}
                id={toggleId}
                expanded={open}
                controls={panelId}
                describedBy={titleId}
                testId={`${testId}-info-toggle`}
                onToggle={() => {
                  setOpen(!open);
                }}
              />
            ) : null}
          </div>
          {subtitle === undefined ? null : (
            <p className="mt-4 text-small text-text-secondary">{subtitle}</p>
          )}
        </div>
        {actions === undefined ? null : (
          <div className="flex shrink-0 items-center gap-8">{actions}</div>
        )}
      </header>
      {hasInfo ? (
        <InlineInfoPanel
          id={panelId}
          // "Más información" + title: named by the card title, yet distinct from the card's own region name.
          labelledBy={`${toggleId} ${titleId}`}
          open={open}
          testId={`${testId}-info-panel`}
          className="mt-12"
        >
          {info}
        </InlineInfoPanel>
      ) : null}
      {children === undefined ? null : (
        <div className={eyebrowTitle ? 'mt-12' : 'mt-16'}>{children}</div>
      )}
    </section>
  );
}
