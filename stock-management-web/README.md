# Stock Management (Web)

React + Vite admin panel for managers/owners (stock, transfers, customers, sales, users) and a
lighter dashboard for core team members (check-in/out, personal transfer history).

See the [root README](../README.md) for the full monorepo picture (architecture, roles, all three apps).

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev              # http://localhost:5173
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL, must end with `/api/` (e.g. `http://localhost:8000/api/`) |

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — ESLint

## Structure

- `src/pages/` — one component per route (Login, Dashboard, Stock, Users, Sales, Customers, …)
- `src/components/` — UI primitives, role-specific dashboards, tables, modals
- `src/redux/` — auth + snackbar state
- `services/` — Apisauce/Axios API client per domain, all reading from `VITE_API_URL`

## Deployment

Configured for **Vercel** — `vercel.json` handles SPA routing. Set `VITE_API_URL` to the production
API URL in the Vercel project's environment variables.
