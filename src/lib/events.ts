import data from '../data/events.json';
import { formatRange, todayIST } from './dates.js';
import { Events, check } from './schema';

check(Events, data, 'src/data/events.json');

export type Kind = 'game-dev' | 'esports' | 'community';
export interface ClubEvent {
  slug: string;
  title: string;
  kind: Kind;
  type: string;
  start: string;
  /** Empty or missing for one-day events (Pages CMS saves an empty field as ""). */
  end?: string;
  /** Shown instead of the dates when the mail didn't give exact ones, e.g. "Aug 2025". */
  dateText?: string;
  /** True when `start` is only the announcement date, used for ordering; kept out of the API feed. */
  approx?: boolean;
  time?: string;
  venue?: string;
  with?: string;
  summary: string;
  details?: string[];
  links?: { label: string; url: string }[];
  /** Optional poster or photo, a path under src/assets. */
  image?: string;
  /** Drafts stay off the site and out of the feeds. */
  draft?: boolean;
}

export const kindLabel: Record<Kind, string> = { 'game-dev': 'Game dev', esports: 'Esports', community: 'Community' };

/** Every published event, newest first. */
export const events = (data as ClubEvent[]).filter((e) => !e.draft).toSorted((a, b) => b.start.localeCompare(a.start));

/** The last day of an event. */
export const lastDay = (e: ClubEvent) => e.end || e.start;

export const today = todayIST();
/** Events that haven't ended yet, soonest first. */
export const upcoming = events.filter((e) => lastDay(e) >= today).toReversed();
/** The most recent event that has started. */
export const latest = events.find((e) => e.start <= today);

/** An event's dates for display, e.g. "26–27 Sep" or "Aug 2025". */
export function when(e: ClubEvent, withYear = false) {
  if (!e.dateText) return formatRange(e.start, lastDay(e), withYear);
  return withYear && !/\d{4}/.test(e.dateText) ? `${e.dateText} ${e.start.slice(0, 4)}` : e.dateText;
}
