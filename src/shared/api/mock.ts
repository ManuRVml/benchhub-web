// Mock-mode entry of shared/api: the in-memory mock adapters and the contract fixtures they serve. It is kept out of
// the public index.ts on purpose, so an `http` build (VITE_API_MODE=http) never reaches the fixtures: the app loads
// this module only through a dynamic import() behind an `import.meta.env.VITE_API_MODE !== 'http'` branch, which Vite
// folds away at build time (`pnpm check:http-bundle` proves it). Tests, stories and the MSW handlers import it directly.
export {
  createMockPorts,
  INVALID_CREDENTIALS_MESSAGE,
  invalidCredentialsError,
  MOCK_LOGIN_CREDENTIALS,
  mockCredentialsMatch,
  loadFixture,
  MOCK_GAPS,
  MOCK_OPERATIONS,
  mockPayload,
  mockResponse,
  type MockGap,
  type MockOperationId,
  type MockResponse,
} from './adapters/mock';
export { loadContractFixture } from './adapters/mock/mock-data';
