import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { events, lastDay } from '../../lib/events';
import { image } from '../../lib/images';

// The shared SciTech feed shape (Elektronica's is the reference): title, date, type, venue, summary, link.
// Glitch adds optional fields that older readers simply ignore: id, end, kind and image.
export const GET: APIRoute = async ({ site }) => {
  const items = await Promise.all(
    // events the mail gave no exact date for are left out rather than given a made-up one
    events.filter((e) => !e.approx).map(async (e) => ({
      id: e.slug,
      title: e.title,
      date: e.start,
      end: lastDay(e),
      type: e.type,
      kind: e.kind,
      venue: e.venue || '',
      summary: e.summary,
      link: new URL(`/events/#${e.slug}`, site).href,
      ...(e.image ? { image: new URL((await getImage({ src: image(e.image), width: 800, format: 'webp' })).src, site).href } : {}),
    })),
  );
  return new Response(JSON.stringify({ club: 'Glitch', version: 1, events: items }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
