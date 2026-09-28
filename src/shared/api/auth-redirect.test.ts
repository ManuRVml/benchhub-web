import { describe, expect, it } from 'vitest';

import { AUTH_LOGIN_PATH, isInAppPath, loginRedirectUrl } from './auth-redirect';
import { API_BASE_URL } from './http-client';

describe('loginRedirectUrl (A-01)', () => {
  it('is the API root + AUTH_LOGIN_PATH with returnTo and loginHint', () => {
    expect(`${API_BASE_URL}${AUTH_LOGIN_PATH}`).toBe('/api/v1/auth/login');
    expect(loginRedirectUrl({ returnTo: '/inicio', loginHint: ' ana@ecopetrol.com.co ' })).toBe(
      '/api/v1/auth/login?returnTo=%2Finicio&loginHint=ana%40ecopetrol.com.co',
    );
  });

  it('drops an empty hint and a returnTo that is not an in-app path', () => {
    expect(loginRedirectUrl({ returnTo: 'https://evil.example', loginHint: '   ' })).toBe(
      '/api/v1/auth/login',
    );
    expect(loginRedirectUrl({ returnTo: null, loginHint: null })).toBe('/api/v1/auth/login');
  });

  it('accepts only same-origin relative paths', () => {
    expect(isInAppPath('/analisis?ref=tbg-ilp')).toBe(true);
    for (const value of ['//evil.example', '/\\evil.example', 'inicio', '', null, undefined]) {
      expect(isInAppPath(value)).toBe(false);
    }
  });
});
