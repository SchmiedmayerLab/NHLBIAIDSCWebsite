import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { siteConfig } from '../../site.config.mjs';

const dist = join(process.cwd(), 'dist');
const base = siteConfig.base ? `/${siteConfig.base.replace(/^\/+|\/+$/g, '')}` : '';

function listHtml(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listHtml(path) : path.endsWith('.html') ? [path] : [];
  });
}

function routeFor(file: string): string {
  const path = `/${relative(dist, file).split(sep).join('/')}`;
  const route = path.endsWith('/index.html') ? path.slice(0, -'index.html'.length) : path;
  return `${base}${route}`.replace(/\/{2,}/g, '/');
}

const routes = listHtml(dist).map(routeFor).sort();
const route = (path: string) => `${base}${path}`.replace(/\/{2,}/g, '/');

for (const pageRoute of routes) {
  test(`${pageRoute} loads without browser or layout regressions`, async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text());
    });
    page.on('pageerror', (error) => browserErrors.push(error.message));

    const response = await page.goto(pageRoute, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${pageRoute} should return a successful response`).toBe(true);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    expect(await page.locator('body').innerText()).not.toContain('—');
    expect(browserErrors).toEqual([]);

    const overflows = await page.locator('body').evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((element) => {
          const rectangle = element.getBoundingClientRect();
          return rectangle.right > document.documentElement.clientWidth + 1 || rectangle.left < -1;
        })
        .map((element) => `${element.tagName.toLowerCase()}.${element.className}`),
    );
    expect(overflows, `${pageRoute} should not overflow horizontally`).toEqual([]);
  });
}

for (const accessibleRoute of [
  route('/'),
  route('/participate/'),
  route('/work-with-us/'),
  route('/404.html'),
]) {
  test(`${accessibleRoute} has no automated WCAG A/AA violations`, async ({ page }) => {
    await page.goto(accessibleRoute, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('sticky header material preserves hero content clearance', async ({ page }) => {
  await page.goto(route('/'));
  const header = page.locator('.site-header');
  const initial = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>('.site-header')!;
    const hero = document.querySelector<HTMLElement>('.hero')!;
    const copy = document.querySelector<HTMLElement>('.hero-copy')!;
    const headerBox = header.getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    const copyBox = copy.getBoundingClientRect();
    const style = getComputedStyle(header);
    return {
      headerTop: headerBox.top,
      headerBottom: headerBox.bottom,
      heroTop: heroBox.top,
      copyTop: copyBox.top,
      position: style.position,
      backdropFilter: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
    };
  });
  expect(initial.position).toBe('sticky');
  expect(initial.backdropFilter).toContain('blur(4px)');
  expect(Math.abs(initial.heroTop - initial.headerTop)).toBeLessThan(2);
  expect(initial.copyTop).toBeGreaterThanOrEqual(initial.headerBottom);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 500, behavior: 'auto' });
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect
    .poll(() => header.evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThan(2);
});

test('the three center capabilities and leadership are present', async ({ page }) => {
  await page.goto(route('/'));
  await expect(page.locator('.aim-card')).toHaveCount(3);
  await expect(page.locator('.person-card')).toHaveCount(15);
  await expect(page.getByText('Contact Principal Investigator')).toHaveCount(1);
  await expect(page.getByText('Multiple Principal Investigator')).toHaveCount(2);
  await expect(page.getByText('Euan A. Ashley, MB ChB, DPhil')).toBeVisible();
  await expect(page.getByText('Paul Schmiedmayer, PhD')).toBeVisible();
});

test('capabilities and engagement paths use descriptive symbols instead of ornamental counters', async ({
  page,
}) => {
  await page.goto(route('/'));
  await expect(page.locator('.hero-map-capabilities .symbol-icon')).toHaveCount(3);
  await expect(page.locator('.principles .symbol-icon')).toHaveCount(4);
  await expect(page.locator('.aim-card .symbol-icon')).toHaveCount(3);
  await expect(page.locator('.outcome-grid .symbol-icon')).toHaveCount(4);
  await expect(page.locator('.working-group-grid .symbol-icon')).toHaveCount(3);
  await expect(page.locator('.hero-map-capabilities')).not.toContainText(/01|02|03/);

  await page.goto(route('/participate/'));
  await expect(page.locator('.engagement-grid .symbol-icon')).toHaveCount(3);
  await expect(page.locator('.engagement-grid')).not.toContainText(/01|02|03/);

  await page.goto(route('/work-with-us/'));
  await expect(page.locator('.opportunity-grid .symbol-icon')).toHaveCount(2);
  await expect(page.locator('.opportunity-grid')).not.toContainText(/01|02|03/);
});

test('Paul Schmiedmayer is identified as a co-investigator', async ({ page }) => {
  await page.goto(route('/'));
  const card = page.locator('#paul-schmiedmayer');
  await expect(card).toContainText('Paul Schmiedmayer');
  await expect(card).toContainText('Co-Investigator');
  await expect(
    card.getByRole('link', { name: /Paul Schmiedmayer.*Stanford profile/ }),
  ).toHaveAttribute('href', 'https://profiles.stanford.edu/schmiedmayer');
});

test('Mia Levanto is the program manager immediately after the co-investigators', async ({
  page,
}) => {
  await page.goto(route('/'));
  const card = page.locator('#mia-levanto');
  await expect(card).toContainText('Mia Levanto, BS');
  await expect(card).toContainText('Program Manager');
  await expect(card).toContainText('Clinical Research Coordinator, Cardiovascular Medicine');
  await expect(card.getByRole('link', { name: /Mia Levanto.*Stanford profile/ })).toHaveAttribute(
    'href',
    'https://profiles.stanford.edu/mia-levanto',
  );
  const precedingRole = await card.evaluate((element) =>
    element.previousElementSibling?.querySelector('.person-role')?.textContent?.trim(),
  );
  expect(precedingRole).toBe('Co-Investigator');
});

test('the center staff include the newly added Stanford contributors', async ({ page }) => {
  await page.goto(route('/'));

  const david = page.locator('#david-jimenez-morales');
  await expect(david).toContainText('David Jimenez-Morales, PhD');
  await expect(david.locator('.person-role')).toHaveText('Researcher');
  await expect(david.locator('.person-title')).toHaveText('Senior Research Scientist');
  await expect(
    david.getByRole('link', { name: /David Jimenez-Morales.*Stanford profile/ }),
  ).toHaveAttribute('href', 'https://profiles.stanford.edu/david-jimenez-morales');

  const nikolai = page.locator('#nikolai-vetr');
  await expect(nikolai).toContainText('Nikolai G. Vetr, PhD');
  await expect(nikolai.locator('.person-role')).toHaveText('Researcher');
  await expect(nikolai.locator('.person-title')).toHaveText('Research Scientist');
  await expect(nikolai.locator('.person-initials')).toHaveText('NV');

  const jimmy = page.locator('#jimmy-zhen');
  await expect(jimmy).toContainText('Jimmy Zhen, MBA');
  await expect(jimmy.locator('.person-role')).toHaveText('Researcher');
  await expect(jimmy.locator('.person-title')).toHaveText('Software Developer');
  await expect(jimmy.getByRole('link', { name: /Jimmy Zhen.*Stanford profile/ })).toHaveAttribute(
    'href',
    'https://med.stanford.edu/mattlab/our-team.html',
  );
});

test('team portraits load and investigators follow surname order', async ({ page }) => {
  await page.goto(route('/'));

  const portraits = page.locator('.person-image');
  await expect(portraits).toHaveCount(14);
  await expect(page.locator('.person-initials')).toHaveCount(1);
  for (let index = 0; index < 14; index += 1) {
    const portrait = portraits.nth(index);
    await portrait.scrollIntoViewIfNeeded();
    await expect
      .poll(() => portrait.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0);
  }

  const coInvestigatorIds = await page
    .locator('.person-card')
    .evaluateAll((cards) => cards.slice(3, 11).map((card) => card.id));
  expect(coInvestigatorIds).toEqual([
    'bruna-gomes',
    'daniel-katz',
    'jure-leskovec',
    'marco-perez',
    'albert-rogers',
    'ben-rogers',
    'paul-schmiedmayer',
    'holly-tabor',
  ]);
});

test('principal investigators fill the first compact team row on desktop', async ({
  page,
}, testInfo) => {
  test.skip(
    !['desktop-chromium', 'wide-desktop-chromium', 'dark-desktop-chromium'].includes(
      testInfo.project.name,
    ),
  );
  await page.goto(route('/#team'));

  const geometry = await page.locator('.person-card').evaluateAll((cards) =>
    cards.slice(0, 4).map((card) => {
      const cardBounds = card.getBoundingClientRect();
      const imageBounds = card.querySelector('img')?.getBoundingClientRect();
      return {
        top: cardBounds.top,
        cardWidth: cardBounds.width,
        imageWidth: imageBounds?.width ?? 0,
        imageHeight: imageBounds?.height ?? 0,
      };
    }),
  );

  expect(geometry.slice(0, 3).every((item) => Math.abs(item.top - geometry[0].top) < 1)).toBe(true);
  expect(geometry[3].top).toBeGreaterThan(geometry[0].top);
  expect(Math.abs(geometry[0].imageWidth - geometry[0].imageHeight)).toBeLessThan(1);
  expect(geometry[0].imageWidth / geometry[0].cardWidth).toBeLessThan(0.5);
});

test('mobile navigation opens, closes, and restores focus', async ({ page }, testInfo) => {
  test.skip(
    !['compact-phone-chromium', 'phone-webkit', 'large-phone-chromium'].includes(
      testInfo.project.name,
    ),
  );
  await page.goto(route('/'));
  const toggle = page.getByRole('button', { name: 'Menu' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('primary action remains visible near the first compact-phone viewport', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'compact-phone-chromium');
  await page.goto(route('/'));
  const action = page.getByRole('link', { name: 'Explore center capabilities' });
  const box = await action.boundingBox();
  expect(box).toBeTruthy();
  expect((box?.y ?? Infinity) + (box?.height ?? 0)).toBeLessThanOrEqual(850);
});

test('keyboard users can reach the main content and primary navigation', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await page.goto(route('/'));
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('participation page provides a form or an accessible contact fallback', async ({ page }) => {
  await page.goto(route('/participate/'));
  const form = page.getByTitle('NHLBI-AI Stanford Data Science Center engagement form');
  const fallback = page.getByRole('link', {
    name: /Contact the center leadership|Email the center/,
  });
  expect((await form.count()) + (await fallback.count())).toBeGreaterThan(0);
  if (await fallback.count()) {
    await expect(fallback).toHaveAttribute('href', 'mailto:departmentchair@stanford.edu');
  }
});

test('participation separates official calls, collaboration, and future roles', async ({
  page,
}) => {
  await page.goto(route('/participate/'));
  await expect(page.getByRole('link', { name: 'NHLBI-AI opportunities ↗' })).toHaveAttribute(
    'href',
    'https://nhlbi-ai.org/funding-opportunities',
  );
  await expect(
    page.getByRole('link', { name: 'All active NHLBI opportunities ↗' }),
  ).toHaveAttribute(
    'href',
    'https://www.nhlbi.nih.gov/grants-and-training/funding-opportunities-and-contacts',
  );
  await expect(page.getByRole('link', { name: 'Work with us →' })).toHaveAttribute(
    'href',
    route('/work-with-us/'),
  );
  await expect(page.getByText('Join a working group.')).toHaveCount(0);
});

test('future team interest does not imply an advertised vacancy', async ({ page }) => {
  await page.goto(route('/work-with-us/'));
  await expect(
    page.getByRole('heading', { name: 'Build agentic AI for biomedical discovery.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'This is an expression of interest, not an active search.',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Postdoctoral researchers and research fellows' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Research software engineers' })).toBeVisible();
  await expect(
    page.locator('.opportunity-grid').getByRole('link', { name: 'Heartwood ↗' }),
  ).toHaveAttribute('href', 'https://github.com/SchmiedmayerLab/heartwood');
  await expect(page.getByRole('link', { name: 'Search Stanford Careers ↗' })).toHaveAttribute(
    'href',
    'https://careersearch.stanford.edu/',
  );
  const form = page.getByTitle('NHLBI-AI Stanford Data Science Center future opportunities form');
  await expect(form).toBeVisible();

  await page.goto(route('/'));
  await expect(
    page.locator('#aim-agentic-research').getByRole('link', { name: 'Heartwood ↗' }),
  ).toHaveAttribute('href', 'https://github.com/SchmiedmayerLab/heartwood');
  await expect(
    page.locator('.pathway-platforms').getByRole('link', { name: /^Heartwood/ }),
  ).toHaveAttribute('href', 'https://github.com/SchmiedmayerLab/heartwood');
  await expect(page.locator('#primary-navigation a', { hasText: 'Work with us' })).toHaveAttribute(
    'href',
    route('/work-with-us/'),
  );
  await expect(page.getByRole('link', { name: 'Interested in joining the team?' })).toHaveAttribute(
    'href',
    route('/work-with-us/'),
  );
});

test('the center is presented as interoperable across secure research platforms', async ({
  page,
}) => {
  await page.goto(route('/'));
  await expect(page.getByRole('link', { name: /TOPMed/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'dbGaP', exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'BioData Catalyst', exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Terra', exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Seven Bridges by Velsera', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('UK Biobank', { exact: true })).toHaveCount(0);
  await expect(page.getByText('All of Us', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Agentic AI for biomedical discovery.')).toBeVisible();
});

test('the center is visibly connected to the NHLBI-AI initiative', async ({ page }) => {
  await page.goto(route('/'));
  await expect(page.locator('.initiative-link')).toHaveAttribute('href', 'https://nhlbi-ai.org/');
  await expect(
    page.getByRole('link', { name: 'NHLBI-AI Enabled Precision Medicine Initiative' }),
  ).toHaveAttribute('href', 'https://nhlbi-ai.org/');
  await expect(page.getByText('multidisciplinary training', { exact: false })).toBeVisible();
});

test('Stanford identity bar and global footer use the approved link set', async ({ page }) => {
  await page.goto(route('/'));

  const identityBar = page.locator('.stanford-bar');
  await expect(identityBar.getByRole('link', { name: 'Stanford University' })).toHaveAttribute(
    'href',
    'https://www.stanford.edu/',
  );

  const globalFooter = page.locator('.stanford-global-footer');
  await expect(
    globalFooter.getByRole('link', { name: 'Stanford University home' }),
  ).toHaveAttribute('href', 'https://www.stanford.edu/');
  await expect(globalFooter.getByRole('link')).toHaveCount(11);
  await expect(globalFooter.getByRole('link').allTextContents()).resolves.toEqual([
    'StanfordUniversity',
    'Stanford Home (link is external)',
    'Maps & Directions (link is external)',
    'Search Stanford (link is external)',
    'Emergency Info (link is external)',
    'Terms of Use (link is external)',
    'Privacy (link is external)',
    'Copyright (link is external)',
    'Trademarks (link is external)',
    'Non-Discrimination (link is external)',
    'Accessibility (link is external)',
  ]);
  await expect(globalFooter).toContainText('© Stanford University. Stanford, California 94305.');
});

test('the site remains usable with reduced motion requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(route('/'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get involved' })).toBeVisible();
});
