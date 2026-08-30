import { siteConfig } from '../../site.config.mjs';
import { withBase } from './paths';

export type JsonLdNode = Record<string, unknown>;

export function absoluteUrl(path: string): string {
  return new URL(withBase(path), siteConfig.url).toString();
}

export function organizationId(): string {
  return `${absoluteUrl('/')}#organization`;
}

export function websiteId(): string {
  return `${absoluteUrl('/')}#website`;
}

export function organizationEntity(): JsonLdNode {
  return {
    '@type': 'ResearchOrganization',
    '@id': organizationId(),
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: absoluteUrl('/'),
    logo: absoluteUrl(siteConfig.discovery.organizationLogo),
    knowsAbout: [
      'Biomedical artificial intelligence',
      'Heart, lung, blood, and sleep research',
      'Multimodal foundation models',
      'Agentic research workflows',
      'Reproducible biomedical data science',
    ],
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: siteConfig.institution.name,
      url: siteConfig.institution.url,
    },
    funder: {
      '@type': 'GovernmentOrganization',
      name: siteConfig.funder.name,
      alternateName: siteConfig.funder.shortName,
      url: siteConfig.funder.url,
    },
    isPartOf: {
      '@type': 'ResearchProject',
      name: siteConfig.initiative.name,
      alternateName: siteConfig.initiative.shortName,
      url: siteConfig.initiative.url,
    },
  };
}

export function websiteEntity(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': websiteId(),
    url: absoluteUrl('/'),
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: siteConfig.institution.locale,
    publisher: { '@id': organizationId() },
  };
}
