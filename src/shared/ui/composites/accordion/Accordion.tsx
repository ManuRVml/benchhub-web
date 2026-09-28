import * as RadixAccordion from '@radix-ui/react-accordion';

import { cn } from '@/shared/lib';

import { accordionTestIds } from './test-ids';

import type { ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  /** Header title, already translated (e.g. the category "Rentabilidad"). */
  title: ReactNode;
  /** Secondary header text (e.g. "GE supera en 2 de 3"). */
  summary?: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: readonly AccordionItem[];
  /** Ids open on first render (uncontrolled); SCR-08 opens every category, so pass all ids there. */
  defaultOpen?: string[];
  /** Open ids (controlled). */
  value?: string[];
  onValueChange?: (open: string[]) => void;
  /** Level of the header headings (default 3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Test-id owner: items `{scope}-{component}-accordion-item-{id}`, triggers `…-accordion-trigger-{id}`. */
  testIds?: { scope: string; component: string };
  className?: string;
}

/**
 * Collapsible grouped sections (catalogue "Accordion"; SCR-08 company comparison categories): Radix Accordion with
 * `type="multiple"`, so any number of sections can be open. Each header is a heading wrapping a button with
 * `aria-expanded` / `aria-controls`; Enter / Space toggle it and ArrowDown / ArrowUp / Home / End move between headers.
 * Controlled (`value` + `onValueChange`) or uncontrolled (`defaultOpen`). Empty `items` render nothing.
 */
export function Accordion({
  items,
  defaultOpen,
  value,
  onValueChange,
  headingLevel = 3,
  testIds,
  className,
}: AccordionProps) {
  if (items.length === 0) return null;
  const Heading = `h${String(headingLevel)}` as 'h3';
  const state = value === undefined ? { defaultValue: defaultOpen ?? [] } : { value };
  return (
    <RadixAccordion.Root
      type="multiple"
      {...state}
      {...(onValueChange ? { onValueChange } : {})}
      className={cn('grid gap-8', className)}
    >
      {items.map((item) => (
        <RadixAccordion.Item
          key={item.id}
          value={item.id}
          {...(testIds
            ? { 'data-testid': accordionTestIds.item(testIds.scope, testIds.component, item.id) }
            : {})}
          className="overflow-hidden rounded-md border border-border-default bg-surface-card"
        >
          <RadixAccordion.Header asChild>
            <Heading className="m-0">
              <RadixAccordion.Trigger
                {...(testIds
                  ? {
                      'data-testid': accordionTestIds.trigger(
                        testIds.scope,
                        testIds.component,
                        item.id,
                      ),
                    }
                  : {})}
                className="group flex w-full cursor-pointer items-center gap-8 bg-surface-page px-16 py-12 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus"
              >
                <span className="text-body-strong text-text-heading">{item.title}</span>
                {item.summary ? (
                  <span className="text-label text-text-secondary">{item.summary}</span>
                ) : null}
                <span
                  aria-hidden="true"
                  className="ml-auto text-text-secondary transition-transform group-data-[state=open]:rotate-90 motion-reduce:transition-none"
                >
                  {'›'}
                </span>
              </RadixAccordion.Trigger>
            </Heading>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="border-t border-border-default">
            {item.content}
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
