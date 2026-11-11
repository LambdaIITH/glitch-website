// The build's gate on edited content. Anything an editor types (through Pages CMS or any other tool) must pass,
// or `astro build` fails and Netlify keeps the last good deploy live.
import { z } from 'astro/zod';

const blank = z.literal(''); // Pages CMS saves empty fields as ""
// https only, or a path on this site (not //host). Plain z.url() would accept javascript: and data: URLs.
const url = z.union([z.url({ protocol: /^https$/ }), z.string().regex(/^\/(?!\/)[a-z0-9/#-]*$/)], {
  error: 'must start with https:// (or / for a page on this site)',
});
// No markup: the /api feeds hand these strings to other sites.
const text = z.string().regex(/^[^<>]*$/, 'must not contain < or >');
const slug = z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and dashes only');
const image = z.string().regex(/^[a-z0-9/_.-]+\.(webp|png|jpe?g)$/i, 'must be a webp, png or jpg under src/assets');

export const Events = z.array(z.object({
  slug, title: text, summary: text, type: text,
  kind: z.enum(['game-dev', 'esports', 'community']),
  start: z.iso.date(), end: z.iso.date().or(blank).optional(),
  dateText: text.optional(), time: text.optional(), venue: text.optional(), with: text.optional(),
  details: z.array(text).optional(),
  links: z.array(z.object({ label: text, url })).optional(),
  image: image.or(blank).optional(),
}));

export const Games = z.array(z.object({
  slug, title: text, summary: text, genre: text, tagline: text.optional(),
  link: url.or(blank).optional(), page: url.or(blank).optional(),
  image, alt: text,
  focus: z.string().regex(/^\d{1,3}% \d{1,3}%$/, 'two percentages, e.g. 78% 55%').or(blank).optional(), // goes into style=""
}));

export const Club = z.object({
  email: z.email(), discord: url, itch: url, instagram: url, linkedin: url, github: url,
  leads: z.array(z.object({ name: text, role: text })),
});

/** Throw a readable build error naming the file and the bad field. */
export function check<T>(schema: z.ZodType<T>, data: unknown, file: string) {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`Unsafe or invalid content in ${file}:\n${z.prettifyError(result.error)}`);
}
