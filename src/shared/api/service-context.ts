import { createContext, useContext } from 'react';

import type { HttpClient } from './http-client';
import type { ApiPorts } from './ports';

export type ApiMode = 'http' | 'mock';

/**
 * Services the app reaches through `useServices()` (brief §4.3): one port per screen / domain (`home`, `analyses`,
 * `results`, `analysisDrafts`…), the raw client and the mode they were built for. The container is built and provided
 * by the app layer (`src/app/providers`); it lives in shared so entity hooks can read it (FSD: entities import shared).
 */
export interface ServiceContainer extends ApiPorts {
  http: HttpClient;
  mode: ApiMode;
}

/** Context of the service container; `ServiceProvider` (app layer) supplies the value. */
export const ServiceContext = createContext<ServiceContainer | null>(null);

/** The service container of the nearest `ServiceProvider`; throws when there is none. */
export function useServices(): ServiceContainer {
  const services = useContext(ServiceContext);
  if (!services) throw new Error('useServices must be used inside <ServiceProvider>');
  return services;
}
