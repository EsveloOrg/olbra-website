# Olbra Website

Fintech website for Olbra Finance - Poland's first złoty stablecoin issuer. Showcases the PLNY/EURY/USDY stablecoin ecosystem.

## Tech Stack

- **Vite** - Development server and build tool
- **TailwindCSS + daisyUI** - Styling and UI components
- **Vanilla HTML/CSS/JS** - No React or heavy frameworks
- Light theme with blue accent colors (#4d93ff)

## Commands

```bash
npm run dev      # Start development server (localhost:5173)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
```

## Project Structure

```
olbra-website/
├── index.html           # Home/landing page
├── stablecoins.html     # PLNY/EURY/USDY stablecoin details
├── token.html           # $OLBRA token information
├── services.html        # Ecosystem services overview
├── payments.html        # Global payments feature page
├── faq.html             # FAQ with accordion
├── docs.html            # Documentation hub
├── blog.html            # Blog listing
├── blog-post.html       # Blog post template
├── privacy-policy.html  # Privacy policy
├── src/
│   ├── main.js          # JavaScript (mobile menu, scroll reveal, FAQ accordion, etc.)
│   └── style.css        # TailwindCSS imports + custom component styles
├── assets/              # Images, videos, SVGs (publicDir for Vite)
├── tailwind.config.js   # Theme colors, fonts, animations, daisyUI config
├── vite.config.js       # Multi-page app config with all HTML entry points
└── AGENTS.md            # Development guidelines
```

## Development Guidelines

- **Mobile-first** responsive design
- **Prefer CSS animations** over JS when possible
- **Use daisyUI classes** for UI components (btn, card, modal, etc.)
- **Optimize images** - WebP format, lazy loading
- **Minimize JS** - Only for interactivity that CSS can't handle
- **No unnecessary libraries** - Keep dependencies minimal

## Key Styles

Custom classes defined in `src/style.css`:
- `.btn-primary`, `.btn-secondary`, `.btn-outline` - Button variants
- `.card-base`, `.card-glass`, `.card-highlight` - Card styles
- `.bento-grid`, `.bento-item`, `.bento-large`, `.bento-featured` - Bento grid layout
- `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale` - Scroll animations
- `.heading-xl`, `.heading-lg`, `.heading-md`, `.heading-sm` - Typography
- `.nav-link`, `.footer-link` - Navigation styles
- `.faq-item`, `.faq-question`, `.faq-answer` - FAQ accordion

## Color Palette (tailwind.config.js)

- `olbra-blue`: #4d93ff (primary)
- `olbra-accent`: #8b5cf6 (purple accent)
- `olbra-dark`: #070019 (dark backgrounds)
- `olbra-muted`: #64748b (muted text)
- `olbra-gray-*`: Gray scale variants

## Fonts

- **Display**: Space Grotesk (headings)
- **Body**: Satoshi (body text)
- **Clash**: Clash Display (accent text)

## Video Assets

For videos with transparency (alpha channel):
- Use WebM VP9 for Chrome/Firefox
- Use MP4 with HEVC alpha (hvc1 codec) for Safari
- Include both sources in video element for cross-browser support

```html
<video autoplay loop muted playsinline>
  <source src="/assets/video-safari.mp4" type="video/mp4; codecs=hvc1">
  <source src="/assets/video.webm" type="video/webm">
</video>
```
