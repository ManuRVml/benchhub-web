import type { Slide } from './types';

// The `empty` slide carries only its kind (V-42); every other kind has key, label, moduleLabel and pageLabel.

export const slideKey = (slide: Slide | undefined): string | undefined =>
  slide && 'key' in slide ? slide.key : undefined;

export const slideLabel = (slide: Slide | undefined): string | undefined =>
  slide && 'label' in slide ? slide.label : undefined;

export const slideModuleLabel = (slide: Slide | undefined): string | undefined =>
  slide && 'moduleLabel' in slide ? slide.moduleLabel : undefined;
