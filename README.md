# Data Analytics 101

An interactive data analytics laboratory and curriculum portal built for **Virtual Assistant Services Level III**. Students practice spreadsheet formulas and SQL querying inside live browser-based sandboxes with instant feedback, progress tracking, and official completion exports.

## Curriculum Modules

- **Module 1: Transforming Data with Excel** — Interactive spreadsheet sandbox covering 20 progressive tasks including `SUM`, `AVERAGE`, `IF`, `VLOOKUP`, conditional formatting, data validation, charts, and slicers.
- **Module 2: SQL Around the World** — Hands-on `SELECT`, `FROM`, and case-sensitive `WHERE` filtering across `hello`, `shapes`, and `countries` tables with interactive SVG picture and world map views.
- **Module 3: Ordering and Limiting** — Sorting (`ORDER BY ... ASC/DESC`) and slicing (`LIMIT`) across `moons`, `animals`, and `countries` datasets.
- **Module 4: Successful Movies** — Analytical SQL investigation comparing film revenue, budgets, ratings averages, and MPAA categories across 50 years of cinema.
- **Interactive Lesson Plans** — Structured module lessons with embedded Freestyle SQL Playgrounds.

## Features

- **Adaptive Theme System** — Automatically detects and follows the OS `prefers-color-scheme` setting in real time, supports persistent `localStorage` manual overrides, and animates the Sun/Moon toggle with a smooth 180° Framer Motion rotation.
- **Strict Case-Sensitive SQL Sandboxes** — Case-sensitive quoted string comparisons (`=`, `!=`, `<>`, `LIKE`, `IN`) across all SQL modules and freestyle playgrounds.
- **Student Credentials & Reports** — Local credential syncing with downloadable PDF/HTML laboratory assessment certificates.

## Tech Stack

- **Vite 6** + **React 19** + **TypeScript**
- **Tailwind CSS** + **Framer Motion (`motion`)**
- **Phosphor Icons**, **html2canvas**, **jsPDF**, **canvas-confetti**

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start local development server (http://localhost:3000)
npm run dev

# Type-check
npm run lint

# Build production bundle to ./dist
npm run build
```

## Deployment

Pushing to `main` automatically builds and deploys `./dist` to GitHub Pages via `.github/workflows/deploy.yml`.
