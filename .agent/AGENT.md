# Agent Guide - MicYou Website

This document provides project context and development guidelines for AI agents.

## Project Overview

MicYou Website is the official documentation site for the MicYou application. MicYou transforms Android devices into high-quality microphones for PC.

### Core Features

- Multiple connection modes: Wi-Fi, USB (ADB/AOA), Bluetooth
- Professional audio processing: noise suppression, AGC, de-reverberation
- Virtual microphone support (with VB-Cable)
- Cross-platform: Windows, Linux, macOS

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| VitePress | 2.0.0-alpha | Static site generator |
| Vue | 3.5 | Frontend framework |
| @theojs/lumen | 6.4 | Theme component library |
| pnpm | 10.x | Package manager |
| TypeScript | - | Type support |
| Biome | 2.x | Code formatting and linting |

## Project Structure

```
Website-MicYou/
├── .agent/                 # AI agent configuration
│   ├── AGENT.md            # Agent guide
│   └── Skill.md            # Skill definitions
├── .github/
│   └── workflows/          # GitHub Actions deployment
├── .vitepress/
│   ├── config.mts          # Main VitePress config
│   ├── cache/              # Build cache
│   ├── data/               # i18n translation data
│   │   ├── i18n.ts         # Translation entry
│   │   └── lang/           # Language files
│   │       ├── zh.ts       # Simplified Chinese
│   │       ├── en.ts       # English
│   │       └── zh_tw.ts    # Traditional Chinese
│   ├── theme/              # Custom theme
│   │   ├── index.ts        # Theme entry
│   │   ├── style.css       # Custom styles
│   │   └── components/     # Custom components
│   └── dist/               # Build output
├── src/
│   ├── index.md            # Homepage
│   ├── docs/               # Documentation pages
│   │   ├── sidebar.ts      # Sidebar config
│   │   ├── quick-start.md
│   │   └── faq.md
│   ├── en/                 # English content
│   ├── zh-TW/              # Traditional Chinese content
│   └── public/             # Static assets
├── package.json
└── pnpm-lock.yaml
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview build result
pnpm preview

# Run linter
pnpm lint

# Format code
pnpm format
```

## Internationalization (i18n)

Three languages are supported:

| Code | Language | Path Prefix |
|------|----------|-------------|
| zh-CN | Simplified Chinese | `/` (root) |
| en | English | `/en/` |
| zh-TW | Traditional Chinese | `/zh-TW/` |

### Steps to Add a New Language

1. Create a language file in `.vitepress/data/lang/` (e.g., `ja.ts`)
2. Import and register it in `.vitepress/data/i18n.ts`
3. Add configuration to `locales` in `.vitepress/config.mts`
4. Create corresponding language directory under `src/`
5. Update translations in `src/docs/sidebar.ts`

## Theme Customization

The project uses the `@theojs/lumen` theme component library, providing:

| Component | Description |
|-----------|-------------|
| `Footer` | Footer component |
| `BoxCube` | Box display component |
| `Card` | Card component |
| `Links` | Links component |
| `Pill` | Pill tag component |

### Custom Components

Located in `.vitepress/theme/components/`:

- `Contributors` - Contributor display component

## Adding New Documentation

1. Create a Markdown file in `src/docs/`
2. Create translations in `src/en/docs/` and `src/zh-TW/docs/`
3. Update sidebar links in `src/docs/sidebar.ts`
4. Update language translation configs if needed

### Frontmatter Requirements

All documentation pages **must** include frontmatter at the beginning:

```markdown
---
title: Page Title - Site Name
description: Brief description for SEO (150-160 characters recommended).
---

# Page Title

Content...
```

**Required fields:**

| Field | Description |
|-------|-------------|
| `title` | Page title, typically includes site name suffix |
| `description` | SEO description for search engines and social sharing |

**Examples:**

```markdown
---
title: Quick Start - MicYou Installation Guide
description: MicYou quick start guide with detailed installation and configuration instructions for Windows, macOS, Linux, and Android.
---

---
title: FAQ - MicYou Troubleshooting
description: MicYou FAQ including device connection issues, firewall settings, ADB configuration, and audio output troubleshooting.
---
```

**Homepage exception:** Uses `layout: home` with hero and features configuration instead of standard frontmatter.

## Image Handling

- **Never use external image links** (GitHub issue attachments, external URLs, etc.)
- All images must be stored in `src/public/` folder
- Reference images using root-relative paths: `![Description](/image-name.png)`
- Use descriptive, lowercase file names with hyphens (e.g., `input-device.png`)
- Supported formats: PNG, JPG, SVG, WebP, GIF

## Deployment

- Automatic deployment to GitHub Pages via GitHub Actions
- Triggered on push to main branch
- Build output located in `.vitepress/dist/`

## Code Standards

- Use TypeScript for configuration files
- Markdown files use frontmatter for page configuration
- Components use Vue 3 Composition API
- Follow VitePress official documentation standards

## Notes

- Node.js version requirement: 22 or higher
- Use pnpm as package manager (not npm/yarn)
- `.vitepress/dist/` and `.vitepress/cache/` are gitignored
- When modifying i18n, update all three languages synchronously