# fundflow-app — React 18 Dashboard

The frontend dashboard for FundFlow. Displays investment fund data with filtering, trend indicators, and an AI chat advisor per fund.

---

## Stack

- React 18
- Vite 8
- Material UI (MUI) v5
- Axios
- nginx (production)

---

## Features

- Fund table with 30 real market instruments (ETFs, stocks, mutual funds)
- Risk level chips — color coded (Low/Medium/High)
- YTD, 1Y, 3Y return indicators with trend icons
- Category filter dropdown
- Slide-in AI chat drawer per fund powered by Gemini 2.5 Flash
- Responsive layout using MUI Grid

---

## Project structure

```
fundflow-app/
├── src/
│   ├── App.jsx                  # Root component, theme, drawer state
│   ├── components/
│   │   ├── FundsTable.jsx       # Main data table with filters
│   │   └── ChatDrawer.jsx       # Slide-in AI chat panel
│   └── services/
│       ├── fundApi.js           # BFF API calls for fund data
│       └── chatApi.js           # BFF API calls for AI chat
├── nginx.conf                   # Production nginx config (port 8080)
├── vite.config.js               # Dev proxy → BFF localhost:8080
└── Dockerfile                   # Multi-stage: Node build + nginx serve
```

---

## Running locally

```bash
cd fundflow-app
npm install
npm run dev
# Opens at http://localhost:3000
```

The Vite dev server proxies `/api/*` to `http://localhost:8080` (BFF). Make sure the BFF is running via Docker Compose first.

---

## Environment variables

| Variable | When | Description |
|----------|------|-------------|
| `VITE_API_BASE_URL` | Build time | BFF base URL for production builds |

In development this is empty — Vite proxy handles routing. In production it is baked into the JS bundle at compile time via `--build-arg`.

---

## Building Docker image

```bash
# Development / local Docker
docker build -t fundflow-app ./fundflow-app

# Production with real BFF URL
docker build \
  --build-arg VITE_API_BASE_URL=http://your-alb-url.amazonaws.com \
  -t fundflow-app ./fundflow-app
```

Multi-stage build: Node 20 alpine builds the Vite bundle, nginx alpine serves the static files. The `VITE_API_BASE_URL` is injected at build time — it cannot be changed at runtime.

---

## Key design decisions

**Why Vite over CRA?** Create React App is unmaintained since 2023. Vite is the current industry standard — cold start in 300ms vs 10 seconds, instant hot reload.

**Why build-time URL injection?** Vite replaces `import.meta.env.VITE_*` variables during compilation. The final JS bundle contains the literal URL string. This means you cannot change the BFF URL without rebuilding the image — which is intentional for immutable deployments.

**Why nginx in production?** Vite's dev server is not production-ready. nginx serves static files efficiently, handles `try_files` for React Router, and can proxy API calls in environments without a separate reverse proxy.