import type { APIRoute } from 'astro';
import { siteConfig } from '../../site.config.mjs';
import {
  aims,
  biodataCatalystWorkspaces,
  investigators,
  nhlbiDataAccess,
  nhlbiDataPrograms,
  openSourceTools,
  researcherServices,
  workingGroups,
} from '../data/center';
import { absoluteUrl } from '../lib/discovery';

export const GET: APIRoute = () => {
  const records = [
    {
      type: 'WebPage',
      id: absoluteUrl('/'),
      title: siteConfig.name,
      description: siteConfig.description,
    },
    {
      type: 'WebPage',
      id: absoluteUrl('/participate/'),
      title: 'Participate',
      description:
        'Find official funding calls, contact the center about collaboration, or explore future team opportunities.',
    },
    {
      type: 'WebPage',
      id: absoluteUrl('/work-with-us/'),
      title: 'Work with us',
      description:
        'Express interest in future postdoctoral-level research or research software engineering opportunities advancing agentic AI with the center.',
    },
    ...aims.map((aim) => ({
      type: 'ResearchProject',
      id: absoluteUrl(`/#aim-${aim.id}`),
      identifier: aim.id,
      title: aim.title,
      description: aim.summary,
      deliverables: aim.deliverables,
    })),
    ...openSourceTools.map((tool) => ({
      type: 'SoftwareSourceCode',
      id: tool.url,
      identifier: tool.id,
      title: tool.name,
      description: tool.summary,
      url: tool.url,
    })),
    ...investigators.map((person) => ({
      type: 'Person',
      id: absoluteUrl(`/#${person.id}`),
      name: person.name,
      role: person.role,
      affiliation: siteConfig.institution.name,
      description: person.focus,
      profile: person.profileUrl,
      ...(person.image ? { image: absoluteUrl(person.image) } : {}),
    })),
    ...workingGroups.map((group, index) => ({
      type: 'Organization',
      id: absoluteUrl(`/#working-group-${index + 1}`),
      title: group.title,
      description: group.summary,
    })),
    ...researcherServices.map((service, index) => ({
      type: 'Service',
      id: absoluteUrl(`/#service-${index + 1}`),
      title: service.title,
      description: service.summary,
    })),
  ];

  return new Response(
    JSON.stringify(
      {
        schemaVersion: 2,
        canonical: absoluteUrl('/'),
        name: siteConfig.name,
        description: siteConfig.description,
        institution: siteConfig.institution.name,
        funder: siteConfig.funder.name,
        initiative: siteConfig.initiative,
        participation: {
          fundingOpportunities: 'https://nhlbi-ai.org/funding-opportunities',
          workWithUs: absoluteUrl('/work-with-us/'),
        },
        nhlbiDataPrograms,
        nhlbiDataAccess,
        biodataCatalystWorkspaces,
        records,
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
};
