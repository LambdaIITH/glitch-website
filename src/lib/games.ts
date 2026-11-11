import data from '../data/games.json';
import { Games, check } from './schema';

check(Games, data, 'src/data/games.json');

export interface Game {
  slug: string;
  title: string;
  tagline?: string;
  summary: string;
  status: string;
  genre: string;
  platforms: string[];
  tags: string[];
  /** Where to play it, usually the itch.io page. */
  link?: string;
  /** Only for games with their own page on this site. */
  page?: string;
  linkText?: string;
  /** A path under src/assets. */
  image: string;
  alt: string;
  /** Which part of the image tiles show, as a CSS object-position. */
  focus?: string;
  footage?: { src: string; poster: string };
  /** Drafts stay off the site and out of the feeds. */
  draft?: boolean;
}

/** Every published game, in the order the data file lists them. */
export const games = (data as Game[]).filter((g) => !g.draft);
