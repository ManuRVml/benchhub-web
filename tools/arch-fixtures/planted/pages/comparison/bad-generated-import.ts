// Violates the generated-contract fence: only src/shared/api/ imports src/shared/api/generated/ (ADR-0004).
import type { HomeView } from '../../shared/api/generated/model';

export type Home = HomeView;
