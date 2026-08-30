import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const brandDirectory = join(process.cwd(), 'public', 'brand');
const expectedAssets = [
  { name: 'avatar-light', width: 1024, height: 1024 },
  { name: 'avatar-dark', width: 1024, height: 1024 },
  { name: 'social-preview', width: 1200, height: 630 },
  { name: 'bluesky-banner', width: 1500, height: 500 },
  { name: 'linkedin-cover', width: 1128, height: 191 },
];

const browserIcons = [
  { path: join(process.cwd(), 'public', 'favicon-32x32.png'), width: 32, height: 32 },
  { path: join(process.cwd(), 'public', 'apple-touch-icon.png'), width: 180, height: 180 },
];

describe('social brand assets', () => {
  it.each(expectedAssets)('provides $name as matching SVG and PNG files', (asset) => {
    const svg = readFileSync(join(brandDirectory, `${asset.name}.svg`), 'utf8');
    const png = readFileSync(join(brandDirectory, `${asset.name}.png`));

    expect(svg).toContain(`width="${asset.width}"`);
    expect(svg).toContain(`height="${asset.height}"`);
    expect(svg).toContain('NHLBI-AI Stanford Data Science Center');
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(asset.width);
    expect(png.readUInt32BE(20)).toBe(asset.height);
  });
});

describe('browser identity assets', () => {
  it('provides the SVG favicon and web app manifest', () => {
    const favicon = readFileSync(join(process.cwd(), 'public', 'favicon.svg'), 'utf8');
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), 'public', 'site.webmanifest'), 'utf8'),
    ) as { name: string; icons: Array<{ src: string; sizes: string; type: string }> };

    expect(favicon).toContain('<svg');
    expect(favicon).toContain('viewBox="0 0 64 64"');
    expect(manifest.name).toBe('NHLBI-AI Stanford Data Science Center');
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }),
        expect.objectContaining({ src: 'favicon-32x32.png', sizes: '32x32', type: 'image/png' }),
        expect.objectContaining({
          src: 'apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        }),
      ]),
    );
  });

  it.each(browserIcons)('provides $width x $height raster icon at $path', (asset) => {
    const png = readFileSync(asset.path);

    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(asset.width);
    expect(png.readUInt32BE(20)).toBe(asset.height);
  });
});
