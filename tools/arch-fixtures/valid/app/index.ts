import { ComparisonPage } from '../pages/comparison';
import { routes } from '../shared/config/routes';

export const appRoutes = [{ path: routes.comparison, page: ComparisonPage }] as const;
