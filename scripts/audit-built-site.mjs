import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { parse } from 'parse5';
import { siteConfig } from '../site.config.mjs';

const dist = resolve(process.cwd(), 'dist');
const base = siteConfig.base ? `/${siteConfig.base.replace(/^\/+|\/+$/g, '')}` : '';
const canonicalOrigin = new URL(siteConfig.url).origin;
const internalOrigin = 'https://built-site.invalid';
const failures = [];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );
  return nested.flat();
}

function publicFilePath(file) {
  return `${base}/${relative(dist, file).split(sep).join('/')}`.replace(/\/{2,}/g, '/');
}

function pagePath(file) {
  const publicPath = publicFilePath(file);
  if (!publicPath.endsWith('/index.html')) return publicPath;
  return publicPath.slice(0, -'index.html'.length);
}

function visit(node, callback) {
  callback(node);
  for (const child of node.childNodes ?? []) visit(child, callback);
  if (node.content) visit(node.content, callback);
}

function attributes(node) {
  return new Map((node.attrs ?? []).map((attribute) => [attribute.name, attribute.value]));
}

function normalizeInternalUrl(raw, fromPath) {
  const value = raw.trim();
  if (!value) return { error: 'empty URL' };
  if (/^(?:mailto:|tel:|data:|blob:)/i.test(value)) return { external: true };
  if (/^javascript:/i.test(value)) return { error: 'javascript: URLs are not allowed' };

  try {
    const absolute = new URL(value, `${internalOrigin}${fromPath}`);
    if (absolute.origin !== internalOrigin && absolute.origin !== canonicalOrigin) {
      return { external: true };
    }
    const pathname = decodeURI(absolute.pathname).replace(/\/{2,}/g, '/');
    if (base && pathname !== base && !pathname.startsWith(`${base}/`)) {
      return { error: `internal URL escapes configured base “${base}”` };
    }
    return { pathname, hash: decodeURIComponent(absolute.hash.slice(1)) };
  } catch {
    return { error: 'malformed URL' };
  }
}

function candidateTargets(pathname) {
  const clean = pathname || `${base}/`;
  return clean.endsWith('/')
    ? [clean, `${clean}index.html`]
    : [clean, `${clean}/`, `${clean}.html`];
}

const files = await listFiles(dist);
const publicFiles = new Set(files.map(publicFilePath));
const htmlFiles = files.filter((file) => extname(file) === '.html');
const pages = new Map();
const canonicalOwners = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const document = parse(html);
  const path = pagePath(file);
  const ids = new Set();
  const links = [];
  const navigationalLinks = [];
  let titleCount = 0;
  let h1Count = 0;
  let mainCount = 0;
  let descriptionCount = 0;
  let canonicalCount = 0;
  let faviconCount = 0;
  let appleTouchIconCount = 0;
  let manifestCount = 0;
  let jsonLdCount = 0;
  const faviconTypes = new Set();
  const openGraph = new Set();
  let canonical;

  visit(document, (node) => {
    const attrs = attributes(node);
    const id = attrs.get('id');
    if (id) {
      if (ids.has(id)) failures.push(`${path}: duplicate id “${id}”`);
      ids.add(id);
    }
    if (node.tagName === 'title') titleCount += 1;
    if (node.tagName === 'h1') h1Count += 1;
    if (node.tagName === 'main') mainCount += 1;
    if (node.tagName === 'meta' && attrs.get('name') === 'description') descriptionCount += 1;
    if (node.tagName === 'meta' && attrs.get('property')?.startsWith('og:')) {
      openGraph.add(attrs.get('property'));
    }
    if (node.tagName === 'script' && attrs.get('type') === 'application/ld+json') jsonLdCount += 1;
    if (node.tagName === 'link' && attrs.get('rel')?.split(/\s+/).includes('icon')) {
      faviconCount += 1;
      faviconTypes.add(attrs.get('type'));
    }
    if (node.tagName === 'link' && attrs.get('rel')?.split(/\s+/).includes('apple-touch-icon')) {
      appleTouchIconCount += 1;
    }
    if (node.tagName === 'link' && attrs.get('rel')?.split(/\s+/).includes('manifest')) {
      manifestCount += 1;
    }
    if (node.tagName === 'img' && !attrs.has('alt')) {
      failures.push(`${path}: <img> requires an alt attribute`);
    }
    if (node.tagName === 'link' && attrs.get('rel')?.split(/\s+/).includes('canonical')) {
      canonicalCount += 1;
      canonical = attrs.get('href');
    }

    for (const attribute of ['href', 'src', 'poster', 'action', 'data']) {
      const value = attrs.get(attribute);
      if (value) {
        links.push({ value, attribute, tag: node.tagName ?? 'element' });
        if (node.tagName === 'a' && attribute === 'href') navigationalLinks.push(value);
      }
    }
    const srcset = attrs.get('srcset');
    if (srcset && !srcset.trim().startsWith('data:')) {
      for (const candidate of srcset.split(',')) {
        const value = candidate.trim().split(/\s+/)[0];
        if (value) links.push({ value, attribute: 'srcset', tag: node.tagName ?? 'element' });
      }
    }
  });

  if (titleCount !== 1) failures.push(`${path}: expected one <title>, found ${titleCount}`);
  if (h1Count !== 1) failures.push(`${path}: expected one <h1>, found ${h1Count}`);
  if (mainCount !== 1) failures.push(`${path}: expected one <main>, found ${mainCount}`);
  if (descriptionCount !== 1) {
    failures.push(`${path}: expected one meta description, found ${descriptionCount}`);
  }
  if (canonicalCount !== 1) {
    failures.push(`${path}: expected one canonical link, found ${canonicalCount}`);
  } else if (canonical) {
    const expectedCanonical = new URL(path, `${canonicalOrigin}/`).toString();
    if (canonical !== expectedCanonical) {
      failures.push(`${path}: canonical must be “${expectedCanonical}”, found “${canonical}”`);
    } else if (canonicalOwners.has(canonical)) {
      failures.push(
        `${path}: canonical duplicates ${canonicalOwners.get(canonical)} (${canonical})`,
      );
    } else canonicalOwners.set(canonical, path);
  }
  if (faviconCount !== 2)
    failures.push(`${path}: expected two favicon formats, found ${faviconCount}`);
  for (const type of ['image/svg+xml', 'image/png']) {
    if (!faviconTypes.has(type)) failures.push(`${path}: missing ${type} favicon`);
  }
  if (appleTouchIconCount !== 1) {
    failures.push(`${path}: expected one Apple touch icon, found ${appleTouchIconCount}`);
  }
  if (manifestCount !== 1)
    failures.push(`${path}: expected one web manifest, found ${manifestCount}`);
  if (jsonLdCount !== 1) failures.push(`${path}: expected one JSON-LD graph, found ${jsonLdCount}`);
  for (const property of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
    if (!openGraph.has(property)) failures.push(`${path}: missing ${property} metadata`);
  }

  const record = { file, path, ids, links, navigationalLinks };
  pages.set(path, record);
  pages.set(publicFilePath(file), record);
}

function findTarget(pathname) {
  for (const candidate of candidateTargets(pathname)) {
    if (pages.has(candidate)) return { kind: 'page', record: pages.get(candidate) };
    if (publicFiles.has(candidate)) return { kind: 'file' };
  }
  return undefined;
}

function checkReference(raw, fromPath, context) {
  const resolved = normalizeInternalUrl(raw, fromPath);
  if (resolved.external) return undefined;
  if (resolved.error) {
    failures.push(`${fromPath}: ${context} “${raw}” is invalid (${resolved.error})`);
    return undefined;
  }
  const target = findTarget(resolved.pathname);
  if (!target) {
    failures.push(`${fromPath}: ${context} “${raw}” has no generated target`);
    return undefined;
  }
  if (resolved.hash) {
    if (target.kind !== 'page') {
      failures.push(`${fromPath}: ${context} “${raw}” points to a fragment on a non-HTML file`);
    } else if (!target.record.ids.has(resolved.hash)) {
      failures.push(`${fromPath}: ${context} “${raw}” has no matching fragment id`);
    }
  }
  return target.kind === 'page' ? target.record.path : undefined;
}

const graph = new Map();
for (const record of new Set(pages.values())) {
  for (const link of record.links) {
    checkReference(link.value, record.path, `<${link.tag}> ${link.attribute}`);
  }
  graph.set(
    record.path,
    new Set(
      record.navigationalLinks
        .map((link) => checkReference(link, record.path, '<a> href'))
        .filter(Boolean),
    ),
  );
}

const startPath = `${base}/`.replace(/\/{2,}/g, '/');
const reachable = new Set();
const queue = [startPath];
while (queue.length > 0) {
  const path = queue.shift();
  if (!path || reachable.has(path)) continue;
  reachable.add(path);
  for (const target of graph.get(path) ?? []) queue.push(target);
}
for (const record of new Set(pages.values())) {
  if (record.path.endsWith('/404.html')) continue;
  if (!reachable.has(record.path)) failures.push(`${record.path}: public page is orphaned`);
}

const sitemapFiles = files.filter((file) => /sitemap-\d+\.xml$/.test(file));
const sitemapPaths = new Set();
for (const file of sitemapFiles) {
  const xml = await readFile(file, 'utf8');
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const raw = match[1].replaceAll('&amp;', '&');
    const resolved = normalizeInternalUrl(raw, startPath);
    if (resolved.error || resolved.external) {
      failures.push(`${publicFilePath(file)}: invalid sitemap URL “${raw}”`);
      continue;
    }
    sitemapPaths.add(resolved.pathname);
    checkReference(raw, startPath, 'sitemap URL');
  }
}

const sitemapIndexFile = join(dist, 'sitemap-index.xml');
if (publicFiles.has(`${base}/sitemap-index.xml`.replace(/\/{2,}/g, '/'))) {
  const xml = await readFile(sitemapIndexFile, 'utf8');
  const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
    match[1].replaceAll('&amp;', '&'),
  );
  if (locations.length === 0) failures.push('/sitemap-index.xml: expected at least one sitemap');
  for (const location of locations) checkReference(location, startPath, 'sitemap index URL');
}

for (const record of new Set(pages.values())) {
  const excluded = record.path.endsWith('/404.html') || record.path.endsWith('/search/');
  if (!excluded && !sitemapPaths.has(record.path)) {
    failures.push(`${record.path}: public page is missing from the sitemap`);
  }
}

const siteIndexFile = join(dist, 'site-index.json');
if (publicFiles.has(`${base}/site-index.json`.replace(/\/{2,}/g, '/'))) {
  const index = JSON.parse(await readFile(siteIndexFile, 'utf8'));
  if (index.schemaVersion !== 2) failures.push('/site-index.json: schemaVersion must be 2');
  if (index.canonical !== new URL(startPath, `${canonicalOrigin}/`).toString()) {
    failures.push('/site-index.json: canonical does not match the configured site root');
  }
  if (!Array.isArray(index.records) || index.records.length === 0) {
    failures.push('/site-index.json: records must be a non-empty array');
  }
  for (const field of ['nhlbiDataPrograms', 'nhlbiDataAccess', 'biodataCatalystWorkspaces']) {
    if (!Array.isArray(index[field]) || index[field].length === 0) {
      failures.push(`/site-index.json: ${field} must be a non-empty array`);
      continue;
    }
    for (const resource of index[field]) {
      if (!resource?.name || !resource?.url || !resource?.summary) {
        failures.push(`/site-index.json: every ${field} resource requires name, url, and summary`);
      }
    }
  }
  const recordIds = new Set();
  const indexedPaths = new Set();
  for (const record of index.records ?? []) {
    if (typeof record.id !== 'string' || !record.id) {
      failures.push('/site-index.json: every record requires a non-empty id');
      continue;
    }
    if (recordIds.has(record.id)) failures.push(`/site-index.json: duplicate id “${record.id}”`);
    recordIds.add(record.id);
    checkReference(record.id, startPath, 'site-index record id');
    const resolved = normalizeInternalUrl(record.id, startPath);
    if (!resolved.external && !resolved.error) indexedPaths.add(resolved.pathname);
  }
  for (const sitemapPath of sitemapPaths) {
    if (!indexedPaths.has(sitemapPath)) {
      failures.push(`${sitemapPath}: sitemap page is missing from site-index.json`);
    }
  }
}

const manifestPublicPath = `${base}/site.webmanifest`.replace(/\/{2,}/g, '/');
if (!publicFiles.has(manifestPublicPath)) {
  failures.push(`${manifestPublicPath}: web manifest is missing`);
} else {
  const manifest = JSON.parse(await readFile(join(dist, 'site.webmanifest'), 'utf8'));
  if (!manifest.name || !manifest.short_name || !manifest.theme_color) {
    failures.push('/site.webmanifest: name, short_name, and theme_color are required');
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) {
    failures.push('/site.webmanifest: expected at least three icon sizes');
  } else {
    for (const icon of manifest.icons) {
      if (!icon.src || !icon.sizes || !icon.type) {
        failures.push('/site.webmanifest: every icon requires src, sizes, and type');
      } else {
        checkReference(icon.src, manifestPublicPath, 'manifest icon');
      }
    }
  }
}

const llmsFile = join(dist, 'llms.txt');
if (publicFiles.has(`${base}/llms.txt`.replace(/\/{2,}/g, '/'))) {
  const content = await readFile(llmsFile, 'utf8');
  const links = [...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]);
  if (links.length === 0) failures.push('/llms.txt: expected at least one linked record');
  for (const link of links) checkReference(link, startPath, 'llms.txt link');
}

const rssFile = join(dist, 'rss.xml');
if (publicFiles.has(`${base}/rss.xml`.replace(/\/{2,}/g, '/'))) {
  const xml = await readFile(rssFile, 'utf8');
  const links = [...xml.matchAll(/<(?:link|guid)(?:\s[^>]*)?>(.*?)<\/(?:link|guid)>/g)].map(
    (match) => match[1].replaceAll('&amp;', '&'),
  );
  if (links.length === 0) failures.push('/rss.xml: expected at least one channel or item link');
  for (const link of links) checkReference(link, startPath, 'RSS link');
}

if (failures.length > 0) {
  process.stderr.write(`Built-site audit failed with ${failures.length} problem(s):\n`);
  process.stderr.write(failures.map((failure) => `- ${failure}`).join('\n'));
  process.stderr.write('\n');
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Built-site audit passed: ${new Set(pages.values()).size} HTML pages, ${publicFiles.size} files, ${sitemapPaths.size} sitemap URLs.\n`,
  );
}
