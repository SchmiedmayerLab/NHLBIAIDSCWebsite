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

const item = (label: string, path: string, summary: string) =>
  `- [${label}](${absoluteUrl(path)}): ${summary}`;

export const GET: APIRoute = () => {
  const lines = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.description}`,
    '',
    `Canonical site: ${absoluteUrl('/')}`,
    `Institution: ${siteConfig.institution.name}`,
    `Funder: ${siteConfig.funder.name} (${siteConfig.funder.shortName})`,
    `Initiative: ${siteConfig.initiative.name} (${siteConfig.initiative.url})`,
    '## Core pages',
    '',
    item('Center overview', '/', 'Mission, capabilities, services, community, and team.'),
    item(
      'Participate',
      '/participate/',
      'Official funding calls, center collaboration, and future team opportunities.',
    ),
    item(
      'Work with us',
      '/work-with-us/',
      'Expressions of interest from postdoctoral-level researchers advancing agentic systems and research software engineers building dependable shared tools.',
    ),
    `- [Official NHLBI-AI funding opportunities](https://nhlbi-ai.org/funding-opportunities): Authoritative call status, eligibility, deadlines, and application instructions.`,
    '',
    '## Center capabilities',
    '',
    ...aims.map((aim) => `- ${aim.title}. ${aim.summary}`),
    '',
    '## Open-source foundations',
    '',
    ...openSourceTools.map((tool) => `- [${tool.name}](${tool.url}): ${tool.summary}`),
    '',
    '## Center team',
    '',
    ...investigators.map((person) => `- ${person.name}: ${person.role}. ${person.focus}`),
    '',
    '## Working groups',
    '',
    ...workingGroups.map((group) => `- ${group.title}: ${group.summary}`),
    '',
    '## Researcher services',
    '',
    ...researcherServices.map((service) => `- ${service.title}: ${service.summary}`),
    '',
    '## NHLBI data ecosystem',
    '',
    'NHLBI studies and programs generate and curate data. dbGaP governs access to much controlled genomic data. BioData Catalyst brings selected approved datasets, tools, and secure cloud workspaces together for analysis. Terra and Seven Bridges by Velsera provide workspaces within BioData Catalyst.',
    '',
    '### Studies and data programs',
    '',
    ...nhlbiDataPrograms.map(
      (resource) => `- [${resource.name}](${resource.url}): ${resource.summary}`,
    ),
    '',
    '### Access and cloud infrastructure',
    '',
    ...nhlbiDataAccess.map(
      (resource) => `- [${resource.name}](${resource.url}): ${resource.summary}`,
    ),
    ...biodataCatalystWorkspaces.map(
      (resource) => `- [${resource.name}](${resource.url}): ${resource.summary}`,
    ),
    '',
    '## Machine-readable records',
    '',
    `- [Structured site index](${absoluteUrl('/site-index.json')})`,
    `- [XML sitemap](${absoluteUrl('/sitemap-index.xml')})`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
