import { describe, it, expect } from 'vitest';

import {
  COMPANY_COLOR_CLASSES,
  FALLBACK_COMPANY_COLOR,
  companyColorClasses,
  type CompanyColorKey,
} from './company-color';

describe('company-color', () => {
  describe('COMPANY_COLOR_CLASSES', () => {
    it('has entries for all 13 company tokens including fallback', () => {
      const keys = Object.keys(COMPANY_COLOR_CLASSES) as CompanyColorKey[];
      expect(keys.length).toBe(13);
    });

    it('has correct bg and border classes for known companies', () => {
      expect(COMPANY_COLOR_CLASSES.ecopetrol).toEqual({
        bg: 'bg-company-ecopetrol',
        border: 'border-company-ecopetrol',
      });
      expect(COMPANY_COLOR_CLASSES.shell).toEqual({
        bg: 'bg-company-shell',
        border: 'border-company-shell',
      });
      expect(COMPANY_COLOR_CLASSES.totalEnergies).toEqual({
        bg: 'bg-company-total-energies',
        border: 'border-company-total-energies',
      });
      expect(COMPANY_COLOR_CLASSES.oxy).toEqual({
        bg: 'bg-company-oxy',
        border: 'border-company-oxy',
      });
      expect(COMPANY_COLOR_CLASSES.fallback).toEqual({
        bg: 'bg-company-fallback',
        border: 'border-company-fallback',
      });
    });
  });

  describe('FALLBACK_COMPANY_COLOR', () => {
    it('has fallback bg and border classes', () => {
      expect(FALLBACK_COMPANY_COLOR).toEqual({
        bg: 'bg-company-fallback',
        border: 'border-company-fallback',
      });
    });
  });

  describe('companyColorClasses', () => {
    it('returns correct classes for known company slugs', () => {
      expect(companyColorClasses('shell')).toEqual({
        bg: 'bg-company-shell',
        border: 'border-company-shell',
      });
      expect(companyColorClasses('totalEnergies')).toEqual({
        bg: 'bg-company-total-energies',
        border: 'border-company-total-energies',
      });
    });

    it('returns fallback for unknown company slugs', () => {
      expect(companyColorClasses('acme')).toEqual(FALLBACK_COMPANY_COLOR);
    });

    it('returns fallback for null', () => {
      expect(companyColorClasses(null)).toEqual(FALLBACK_COMPANY_COLOR);
    });

    it('returns fallback for undefined', () => {
      expect(companyColorClasses(undefined)).toEqual(FALLBACK_COMPANY_COLOR);
    });

    it('returns fallback for empty string', () => {
      expect(companyColorClasses('')).toEqual(FALLBACK_COMPANY_COLOR);
    });

    it('returns fallback for prototype keys', () => {
      expect(companyColorClasses('__proto__')).toEqual(FALLBACK_COMPANY_COLOR);
      expect(companyColorClasses('toString')).toEqual(FALLBACK_COMPANY_COLOR);
    });
  });

  describe('type CompanyColorKey', () => {
    it('represents the keys of COMPANY_COLOR_CLASSES', () => {
      const keys = Object.keys(COMPANY_COLOR_CLASSES) as CompanyColorKey[];
      expect(keys.length).toBe(13);
    });
  });
});
