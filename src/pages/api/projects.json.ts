import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { games } from '../../lib/games';
import { image } from '../../lib/images';

// Glitch's projects are its games. Shared SciTech fields: title, summary, status, tags, link.
// Glitch adds optional fields that older readers simply ignore: id and image.
export const GET: APIRoute = async ({ site }) => {
  const items = await Promise.all(
    games.map(async (g) => ({
      id: g.slug,
      title: g.title,
      summary: g.summary,
      status: g.status,
      tags: g.tags,
      link: g.link || new URL(g.page || '/games/', site).href,
      image: new URL((await getImage({ src: image(g.image), width: 800, format: 'webp' })).src, site).href,
    })),
  );
  return new Response(JSON.stringify({ club: 'Glitch', version: 1, projects: items }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
