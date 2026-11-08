import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatRange, todayIST } from './dates.js';

test('formatRange', () => {
  assert.equal(formatRange('2026-02-12'), '12 Feb');
  assert.equal(formatRange('2026-09-26', '2026-09-27'), '26–27 Sep');
  assert.equal(formatRange('2026-10-30', '2026-11-01'), '30 Oct – 1 Nov');
  assert.equal(formatRange('2026-10-30', '2026-11-01', true), '30 Oct – 1 Nov 2026');
  assert.equal(formatRange('2024-12-30', '2025-01-02', true), '30 Dec 2024 – 2 Jan 2025');
});

test('todayIST rolls over at midnight IST, not UTC', () => {
  assert.equal(todayIST(new Date('2026-11-07T18:29:00Z')), '2026-11-07');
  assert.equal(todayIST(new Date('2026-11-07T18:31:00Z')), '2026-11-08');
});
