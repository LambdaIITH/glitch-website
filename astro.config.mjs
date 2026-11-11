import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://glitch.iith.dev',
  // The old site's leaderboard URL went out in club mails; netlify.toml also sends a real 301.
  redirects: { '/leaderboard': '/scoreboard/' },
});
