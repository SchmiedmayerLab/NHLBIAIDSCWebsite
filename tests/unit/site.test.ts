import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  organizationEntity,
  organizationId,
  websiteEntity,
  websiteId,
} from '../../src/lib/discovery';
import { isExternal, withBase } from '../../src/lib/paths';
import { investigators } from '../../src/data/center';
import { siteConfig } from '../../site.config.mjs';

describe('portable paths', () => {
  it('keeps external and fragment links unchanged', () => {
    expect(withBase('https://www.stanford.edu/')).toBe('https://www.stanford.edu/');
    expect(withBase('mailto:center@example.edu')).toBe('mailto:center@example.edu');
    expect(withBase('#aims')).toBe('#aims');
  });

  it('normalizes internal paths', () => {
    expect(withBase('/participate/')).toMatch(/\/participate\/$/);
    expect(withBase('participate/')).toMatch(/\/participate\/$/);
  });

  it('recognizes external web URLs', () => {
    expect(isExternal('https://www.nhlbi.nih.gov/')).toBe(true);
    expect(isExternal('/participate/')).toBe(false);
  });
});

describe('structured discovery records', () => {
  it('builds stable canonical identifiers', () => {
    expect(absoluteUrl('/')).toBe('https://nhlbi-ai-dsc.org/');
    expect(organizationId()).toBe('https://nhlbi-ai-dsc.org/#organization');
    expect(websiteId()).toBe('https://nhlbi-ai-dsc.org/#website');
  });

  it('describes Stanford and NHLBI relationships', () => {
    const organization = organizationEntity();
    expect(organization['@type']).toBe('ResearchOrganization');
    expect(organization.parentOrganization).toMatchObject({ name: 'Stanford University' });
    expect(organization.funder).toMatchObject({
      name: 'National Heart, Lung, and Blood Institute',
    });
    expect(organization.isPartOf).toMatchObject({
      name: 'NHLBI-AI Enabled Precision Medicine Initiative',
      url: 'https://nhlbi-ai.org/',
    });
  });

  it('connects the website to the center', () => {
    expect(websiteEntity()).toMatchObject({
      '@type': 'WebSite',
      publisher: { '@id': organizationId() },
    });
  });
});

describe('team portraits', () => {
  it('defines an intentional crop for every investigator', () => {
    expect(investigators).toHaveLength(12);
    for (const investigator of investigators) {
      expect(investigator.portrait.position).toMatch(/^\d+% \d+%$/);
      expect(investigator.portrait.scale).toBeGreaterThanOrEqual(1);
      expect(investigator.portrait.scale).toBeLessThanOrEqual(1.5);
    }
  });
});

describe('participation configuration', () => {
  it('provides published, independently configurable Google Form embeds', () => {
    expect(siteConfig.participation.formUrl).toContain('docs.google.com/forms');
    expect(siteConfig.participation.formUrl).toContain('embedded=true');
    expect(siteConfig.participation.contactEmail).toBe('departmentchair@stanford.edu');
    expect(siteConfig.careerInterest.formUrl).toContain('docs.google.com/forms');
    expect(siteConfig.careerInterest.formUrl).toContain('embedded=true');
    expect(siteConfig.careerInterest.stanfordCareersUrl).toBe('https://careersearch.stanford.edu/');
  });
});
