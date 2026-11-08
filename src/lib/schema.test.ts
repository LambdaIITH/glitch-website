import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Events, Games, Club } from './schema.ts';

const load = (name: string) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'));
const events = load('events.json');
const games = load('games.json');
const club = load('club.json');

test('the real content passes', () => {
  assert.ok(Events.safeParse(events).success);
  assert.ok(Games.safeParse(games).success);
  assert.ok(Club.safeParse(club).success);
});

test('unsafe links fail', () => {
  const withLink = (url: string) => [{ ...events[0], links: [{ label: 'x', url }] }];
  for (const bad of ['javascript:alert(1)', 'JavaScript:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<b>x</b>', 'http://example.com', '//evil.com']) {
    assert.equal(Events.safeParse(withLink(bad)).success, false, bad);
  }
  assert.ok(Events.safeParse(withLink('https://itch.io/jam/x')).success);
  assert.ok(Events.safeParse(withLink('/games/cogito/')).success);
  assert.equal(Club.safeParse({ ...club, discord: 'javascript:alert(1)' }).success, false);
});

test('CSS and markup injection fail', () => {
  assert.equal(Games.safeParse([{ ...games[0], focus: 'center; background-image:url(https://x.example/t)' }]).success, false);
  assert.ok(Games.safeParse([{ ...games[0], focus: '78% 55%' }]).success);
  assert.equal(Events.safeParse([{ ...events[0], title: '<img src=x onerror=alert(1)>' }]).success, false);
});
