# Kanban Board

A Next.js Kanban board with drag-and-drop, search, infinite scroll per column, and toast feedback.

## Requirements

- Node.js 18+
- npm (or pnpm/yarn)

## Setup

```bash
npm install
```

## Run Locally

Start json-server for mock data:

```bash
npx json-server --watch src/db.json --port 3001
```

Start the Next.js app:

```bash
npm run dev
```

Open http://localhost:3000

## Environment

The app reads API base URL from `NEXT_PUBLIC_API_URL`.

Create a `.env.local` file if you want a different API URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Build

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Notes

- Vercel cannot run json-server. For production, point `NEXT_PUBLIC_API_URL` to a hosted API or switch to a storage service.
