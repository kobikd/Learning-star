import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 — configuration file
 *
 * In Tailwind v4 the design tokens (colors, typography, spacing, etc.)
 * are defined via the `@theme` block in `src/index.css`, NOT here.
 * This file is kept for:
 *   - Plugin registration (future: tailwindcss-animate, etc.)
 *   - Content path overrides if needed
 *   - IDE type-checking support
 *
 * Token reference → src/index.css @theme
 * Raw CSS variables → src/styles/globals.css
 */
const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  // RTL support: Tailwind v4 supports `rtl:` variant natively.
  // Use CSS logical properties (margin-inline-start, padding-inline-end, etc.)
  // instead of directional shorthands (margin-right, padding-left).
  plugins: [],
};

export default config;
