import type { ImageMetadata } from 'astro';

// Data files name images by their path under src/assets (Pages CMS uploads land in src/assets/uploads);
// a wrong path fails the build instead of shipping a broken image.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/**/*.{webp,png,jpg,jpeg}', { eager: true });

export function image(path: string): ImageMetadata {
  const file = files[`../assets/${path.replace(/^\/+/, '')}`];
  if (!file) throw new Error(`Missing image: src/assets/${path}`);
  return file.default;
}
