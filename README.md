# Data Analytics 101

Interactive data analytics laboratory curriculum built for hands-on spreadsheet and SQL mastery, with an in-browser execution engine, lesson plans, and verified PDF certificate generation—no backend server required.

## Curriculum Modules

1. **Module 1 — Transforming Data with Excel**: Interactive spreadsheet sandbox with formula evaluation (`UPPER`, `LOWER`, `PROPER`, `CONCAT`, `TRIM`, `IF`, `SUM`, `AVERAGE`, `COUNT`, `VLOOKUP`, etc.), filtering, conditional formatting, data validation, pivot summaries, charts, and slicers.
2. **Module 2 — SQL Around the World**: Core `SELECT`, `FROM`, `WHERE`, logical operators (`AND`, `OR`), `LIKE`, `IN`, and live table/picture/world-map visualizers.
3. **Module 3 — Ordering and Limiting**: Sorting and slicing planetary, wildlife, and global datasets using `WHERE`, `ORDER BY` (`ASC`/`DESC`), and `LIMIT`.
4. **Module 4 — Successful Movies**: Box-office analysis comparing ratings, budgets, revenues, MPAA categories, and column-to-column filters (`WHERE revenue < budget`).

## Key Features

- **In-Memory Browser SQL Engine**: Strictly case-sensitive quoted string matching, quote-aware `AND`/`OR` parsing, `LIKE`/`IN` operators, and instant results tables & visualizations.
- **Keyboard Shortcuts**: Press `Ctrl + Enter` (or `Cmd + Enter`) to run SQL queries and `Ctrl + Shift + Enter` to submit answers across all SQL labs.
- **Student Credentials & Reports**: Synced student profile details included on printable/PDF assessment reports and completion certificates.
- **Light & Dark Theme Support**: Automatic system detection with manual theme switching.

## Local Development

```bash
npm install --legacy-peer-deps
npm run dev
```

The development server runs at `http://localhost:3000/`.

## Production Build

```bash
npm run build
```

Static production files are emitted to `./dist`.

## GitHub Pages Deployment

This repository includes `.github/workflows/deploy.yml`, which automatically builds and publishes `./dist` to GitHub Pages on every push to `main` (or manually via **Actions → Workflow dispatch**).

To enable deployment on GitHub:
1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.

## License & Copyright

© 2026 Stephen Pascua — Data Analytics 101.
