// Proves @types/react and @types/react-dom resolve and type-check under tsc 7 before any app code exists.
import type { ReactNode } from 'react';
import type { Root } from 'react-dom/client';

export type SmokeRender = (root: Root, node: ReactNode) => void;
