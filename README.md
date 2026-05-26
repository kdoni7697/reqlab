# ReqLab

A lightweight, browser-based API client — like a mini Postman, but zero-setup and instantly deployable.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06b6d4)

## Features

- **Color-coded HTTP methods** — GET (green), POST (yellow), PUT (blue), PATCH (purple), DELETE (red)
- **Dynamic headers editor** — Add/remove rows, toggle individual headers on/off
- **Body & Auth tabs** — JSON body editor, Bearer Token, and Basic Auth support
- **Response viewer** — Status badge (color-coded by range), response time, size, Pretty/Raw/Headers views
- **Code snippet generator** — Export requests as cURL, JavaScript fetch, Python, or Go
- **Environment variables** — Define variables and use `{{VAR_NAME}}` substitution in URLs and headers
- **Request history** — Auto-saved with method, status, timing, and relative timestamps
- **Collections** — Organize and save requests into named groups
- **Collapsible sidebar** — Toggle between History and Collections views
- **Dark theme** — Slate + teal accent, easy on the eyes

## Tech Stack

- Next.js 14 + React 18 + TypeScript (strict mode)
- Tailwind CSS 3 — no external UI libraries
- localStorage for all persistence — no backend, no accounts, no API keys
- Zero environment variables needed for deployment

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

1. Push this repo to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Deploy — no configuration needed

## Project Structure

```
app/
  layout.tsx        — Root layout, Inter font, dark bg
  globals.css       — Tailwind directives + utility classes
  page.tsx          — Main app entry point
components/
  RequestPanel.tsx  — Method selector, URL bar, headers/body/auth tabs
  ResponsePanel.tsx — Status badge, timing, Pretty/Raw/Headers views
  Sidebar.tsx       — History & Collections with collapsible panel
  SnippetModal.tsx  — Code snippet generator (cURL/fetch/Python/Go)
  EnvModal.tsx      — Environment variables manager
lib/
  types.ts          — TypeScript interfaces
  storage.ts        — localStorage helpers & env var substitution
```

## License

MIT
