import type { SlideTemplateId } from '../types';

/** Props of a chrome kind view: its slide plus the deck-level members the chrome needs. */
export interface ChromeKindProps<S> {
  slide: S;
  template: SlideTemplateId;
  templateName: string;
  /** Id of the title element (the slide figure's accessible name). */
  titleId: string;
}
