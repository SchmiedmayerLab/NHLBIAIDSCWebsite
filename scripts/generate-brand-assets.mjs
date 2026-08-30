// SPDX-FileCopyrightText: 2026 SchmiedmayerLab contributors
// SPDX-License-Identifier: MIT

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = join(root, 'public', 'brand');
const svgOnly = process.argv.includes('--svg-only');
const sansFont = (
  await readFile(
    join(
      root,
      'node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2',
    ),
  )
).toString('base64');
const serifFont = (
  await readFile(
    join(
      root,
      'node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2',
    ),
  )
).toString('base64');

const colors = {
  cardinal: '#8c1515',
  cardinalBright: '#b83a4b',
  gold: '#e3c887',
  ink: '#2e2d29',
  muted: '#6f6a62',
  line: '#d5d0c0',
  paper: '#f8f6f2',
  teal: '#176d78',
  white: '#ffffff',
};

const title = 'NHLBI-AI Stanford Data Science Center';
const tagline = 'Agentic AI for biomedical discovery.';
const fontStyles = `<style>
  @font-face {
    font-family: 'Source Sans 3';
    src: url(data:font/woff2;base64,${sansFont}) format('woff2');
    font-style: normal;
    font-weight: 200 900;
  }
  @font-face {
    font-family: 'Source Serif 4';
    src: url(data:font/woff2;base64,${serifFont}) format('woff2');
    font-style: normal;
    font-weight: 200 900;
  }
  .sans { font-family: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif; }
  .serif { font-family: 'Source Serif 4', Georgia, serif; }
</style>`;

const mark = ({ x, y, size }) => {
  const scale = size / 80;
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <rect width="80" height="80" rx="18" fill="${colors.cardinal}"/>
    <path d="M15 21h5c12 0 11 16 20 19 9-3 8-19 20-19h5" fill="none" stroke="${colors.white}" stroke-width="4" stroke-linecap="round"/>
    <path d="M15 40h50" fill="none" stroke="${colors.line}" stroke-width="4" stroke-linecap="round"/>
    <path d="M15 59h5c12 0 11-16 20-19 9 3 8 19 20 19h5" fill="none" stroke="${colors.gold}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="40" cy="40" r="5.5" fill="${colors.white}"/>
    <circle cx="15" cy="21" r="2.5" fill="${colors.white}"/>
    <circle cx="15" cy="40" r="2.5" fill="${colors.line}"/>
    <circle cx="15" cy="59" r="2.5" fill="${colors.gold}"/>
  </g>`;
};

const svgDocument = ({ width, height, body, background = '', description = tagline }) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<!--
SPDX-FileCopyrightText: 2026 SchmiedmayerLab contributors
SPDX-License-Identifier: MIT
-->
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${title}</title>
  <desc id="description">${description}</desc>
  ${fontStyles}
  ${background ? `${background}\n  ` : ''}${body}
</svg>
`;

const avatar = ({ background, halo }) =>
  svgDocument({
    width: 1024,
    height: 1024,
    background: `<defs><radialGradient id="halo" cx="82%" cy="14%" r="82%"><stop offset="0" stop-color="${halo}" stop-opacity=".34"/><stop offset="1" stop-color="${background}" stop-opacity="0"/></radialGradient></defs>
      <rect width="1024" height="1024" fill="${background}"/>
      <rect width="1024" height="1024" fill="url(#halo)"/>`,
    body: mark({ x: 192, y: 192, size: 640 }),
    description: `${title} square profile image`,
  });

const assets = [
  {
    name: 'avatar-light',
    width: 1024,
    height: 1024,
    svg: avatar({ background: colors.paper, halo: colors.gold }),
  },
  {
    name: 'avatar-dark',
    width: 1024,
    height: 1024,
    svg: avatar({ background: colors.ink, halo: colors.cardinalBright }),
  },
  {
    name: 'social-preview',
    width: 1200,
    height: 630,
    svg: svgDocument({
      width: 1200,
      height: 630,
      background: `<defs>
          <radialGradient id="warm" cx="6%" cy="92%" r="86%"><stop offset="0" stop-color="${colors.cardinal}" stop-opacity=".2"/><stop offset="1" stop-color="${colors.paper}" stop-opacity="0"/></radialGradient>
          <radialGradient id="cool" cx="96%" cy="4%" r="72%"><stop offset="0" stop-color="${colors.teal}" stop-opacity=".22"/><stop offset="1" stop-color="${colors.paper}" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="1200" height="630" fill="${colors.paper}"/>
        <rect width="1200" height="630" fill="url(#warm)"/>
        <rect width="1200" height="630" fill="url(#cool)"/>`,
      body: `${mark({ x: 80, y: 65, size: 86 })}
        <text class="sans" x="188" y="103" fill="${colors.cardinal}" font-size="22" font-weight="780" letter-spacing="3.2">STANFORD UNIVERSITY</text>
        <text class="serif" x="80" y="282" fill="${colors.ink}" font-size="74" font-weight="720">NHLBI-AI Data</text>
        <text class="serif" x="80" y="365" fill="${colors.ink}" font-size="74" font-weight="720">Science Center</text>
        <text class="sans" x="84" y="450" fill="${colors.muted}" font-size="33" font-weight="540">${tagline}</text>
        <path d="M84 500h560" stroke="${colors.cardinal}" stroke-width="6" stroke-linecap="round"/>
        <g opacity=".1">${mark({ x: 862, y: 198, size: 260 })}</g>`,
    }),
  },
  {
    name: 'bluesky-banner',
    width: 1500,
    height: 500,
    svg: svgDocument({
      width: 1500,
      height: 500,
      background: `<defs><radialGradient id="glow" cx="88%" cy="5%" r="92%"><stop offset="0" stop-color="${colors.teal}" stop-opacity=".48"/><stop offset=".55" stop-color="${colors.cardinalBright}" stop-opacity=".2"/><stop offset="1" stop-color="${colors.ink}" stop-opacity="0"/></radialGradient></defs>
        <rect width="1500" height="500" fill="${colors.ink}"/>
        <rect width="1500" height="500" fill="url(#glow)"/>`,
      body: `${mark({ x: 245, y: 125, size: 250 })}
        <text class="serif" x="555" y="221" fill="${colors.white}" font-size="74" font-weight="720">NHLBI-AI Data</text>
        <text class="serif" x="555" y="300" fill="${colors.white}" font-size="74" font-weight="720">Science Center</text>
        <text class="sans" x="560" y="360" fill="${colors.gold}" font-size="30" font-weight="650">${tagline}</text>
        <text class="sans" x="560" y="407" fill="${colors.line}" font-size="22" font-weight="720" letter-spacing="2.8">STANFORD UNIVERSITY</text>`,
      description: `${title} Bluesky profile banner`,
    }),
  },
  {
    name: 'linkedin-cover',
    width: 1128,
    height: 191,
    svg: svgDocument({
      width: 1128,
      height: 191,
      background: `<defs><linearGradient id="cover" x1="0" x2="1"><stop offset="0" stop-color="${colors.ink}"/><stop offset=".72" stop-color="#383630"/><stop offset="1" stop-color="${colors.cardinal}"/></linearGradient></defs>
        <rect width="1128" height="191" fill="url(#cover)"/>`,
      body: `${mark({ x: 330, y: 43, size: 105 })}
        <text class="serif" x="470" y="89" fill="${colors.white}" font-size="43" font-weight="720">NHLBI-AI Data Science Center</text>
        <text class="sans" x="474" y="130" fill="${colors.gold}" font-size="23" font-weight="620">${tagline}</text>
        <text class="sans" x="475" y="160" fill="${colors.line}" font-size="15" font-weight="720" letter-spacing="2">STANFORD UNIVERSITY</text>`,
      description: `${title} LinkedIn cover image`,
    }),
  },
];

const browserIcons = [
  { name: 'favicon-32x32', width: 32, height: 32 },
  { name: 'apple-touch-icon', width: 180, height: 180 },
];

await mkdir(outputDirectory, { recursive: true });
for (const asset of assets) {
  await writeFile(join(outputDirectory, `${asset.name}.svg`), asset.svg, 'utf8');
}

if (!svgOnly) {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const asset of assets) {
      const page = await browser.newPage({
        viewport: { width: asset.width, height: asset.height },
        deviceScaleFactor: 1,
      });
      await page.goto(pathToFileURL(join(outputDirectory, `${asset.name}.svg`)).href);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: join(outputDirectory, `${asset.name}.png`),
        omitBackground: false,
      });
      await page.close();
    }
    for (const icon of browserIcons) {
      const page = await browser.newPage({
        viewport: { width: icon.width, height: icon.height },
        deviceScaleFactor: 1,
      });
      await page.goto(pathToFileURL(join(root, 'public', 'favicon.svg')).href);
      await page.screenshot({
        path: join(root, 'public', `${icon.name}.png`),
        omitBackground: false,
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

process.stdout.write(
  `Generated ${assets.length} SVG${svgOnly ? '' : ' and PNG'} center brand assets${svgOnly ? '' : ` and ${browserIcons.length} browser icons`} in public.\n`,
);
