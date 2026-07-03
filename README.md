# Flow Media

Premium short-form video editing studio — marketing site.

A single-page, dependency-free site (HTML + CSS + vanilla JS) built around a white canvas
with a neon-lime accent. Light/dark themes, sticky discount bar, a randomised hero video
deck, a draggable portfolio carousel, animated counters, a testimonials marquee, and a
custom blend-mode cursor.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Markup for every section |
| `styles.css` | Design tokens, theming, layout, responsive rules |
| `main.js` | Theme toggle, countdown, counters, carousel, modal, cursor |
| `logo.png` | Brand mark |

## Run locally

No build step. Open `index.html` directly, or serve the folder:

```bash
npx serve .
```

Then visit the printed URL.

## Features

- Light / dark theme toggle (persisted to `localStorage`)
- Sticky announcement bar with live countdown (single row on mobile)
- Hero deck of randomised, reshuffling portfolio frames
- Portfolio shown as a drag- and arrow-navigable carousel with a YouTube modal player
- Animated trust + result counters
- Testimonials as an infinite two-row marquee
- 20%-off pricing with struck original prices
- Accessible FAQ accordion, custom cursor, reduced-motion support

## Contact

Work with us on [Discord](https://discord.com/users/1339213343784964157).
