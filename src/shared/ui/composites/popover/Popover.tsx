import * as RadixPopover from '@radix-ui/react-popover';
import { useCallback, useContext, useId, useMemo, useState } from 'react';

import { cn } from '@/shared/lib';

import { PopoverGroupContext } from './popover-group';

import type { PopoverGroupState } from './popover-group';
import type { ReactNode } from 'react';

export interface PopoverGroupProps {
  children?: ReactNode;
}

/**
 * Single-open group (prototype `chartInfoOpen`, CF-61): opening a popover of the group closes the one that was open.
 * Popovers outside any group are independent. Groups do not nest: a popover joins its nearest group.
 */
export function PopoverGroup({ children }: PopoverGroupProps) {
  const [openId, setOpenIdState] = useState<string | null>(null);
  const value = useMemo<PopoverGroupState>(() => ({ openId, setOpenId: setOpenIdState }), [openId]);
  return <PopoverGroupContext.Provider value={value}>{children}</PopoverGroupContext.Provider>;
}

export interface PopoverProps {
  /** Element that toggles the popover on click (rendered through Radix `Popover.Trigger asChild`). */
  trigger: ReactNode;
  /** Accessible name of the floating panel (`aria-label` of its `role="dialog"`), e.g. the indicator name. */
  label: string;
  /** Controlled open state; inside a `PopoverGroup` the group owns it and this prop is ignored. */
  open?: boolean;
  /** Called on every open / close (trigger click, Esc, outside click, another popover of the group opening). */
  onOpenChange?: (open: boolean) => void;
  /** Side of the trigger the panel opens on (default `bottom`). */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment against the trigger (default `start`). */
  align?: 'start' | 'center' | 'end';
  /** `data-testid` of the panel (default `popover`). */
  testId?: string;
  /** Panel content (formula, explanation…), already translated. */
  children: ReactNode;
}

/**
 * Non-modal floating explanation anchored to its trigger (component catalog "InfoPopover"): `surface.page` panel,
 * `radius.sm`, max width 220, `text.body` micro copy. Radix Popover: Esc and outside clicks close it and focus returns
 * to the trigger. It stacks at `z.upload` so it also floats above an open modal.
 */
export function Popover({
  trigger,
  label,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  testId = 'popover',
  children,
}: PopoverProps) {
  const id = useId();
  const group = useContext(PopoverGroupContext);
  const setGroupOpenId = group?.setOpenId;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setGroupOpenId?.((current) => (next ? id : current === id ? null : current));
      onOpenChange?.(next);
    },
    [id, onOpenChange, setGroupOpenId],
  );

  const state = group ? { open: group.openId === id } : open === undefined ? {} : { open };

  return (
    <RadixPopover.Root {...state} onOpenChange={handleOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          aria-label={label}
          data-testid={testId}
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={16}
          className={cn(
            'z-(--z-upload) max-w-55 rounded-sm border border-border-default bg-surface-page px-14 py-10',
            'text-micro text-text-body',
          )}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
