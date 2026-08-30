import type { APIRoute } from 'astro';
import { siteConfig } from '../../site.config.mjs';
import { withBase } from '../lib/paths';

export const GET: APIRoute = () => {
  const indexingEnabled = siteConfig.discovery.indexing;
  const sitemap = new URL(withBase('/sitemap-index.xml'), siteConfig.url);
  const lines = indexingEnabled
    ? [
        'User-agent: OAI-SearchBot',
        siteConfig.discovery.aiSearch ? 'Allow: /' : 'Disallow: /',
        '',
        'User-agent: GPTBot',
        siteConfig.discovery.aiTraining ? 'Allow: /' : 'Disallow: /',
        '',
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${sitemap}`,
      ]
    : ['User-agent: *', 'Disallow: /'];

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
