# IDX Stock Screener

A two-part stock screener for Indonesia Stock Exchange equities:

- `backend/`: FastAPI API that fetches IDX ticker data from Yahoo Finance and stores watchlist items in SQLite.
- `frontend/`: Next.js App Router UI for screening, stock detail views, charts, and watchlist management.

## Prerequisites

- Python 3.11 or newer
- Node.js 20.9 or newer
- npm

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

The API exposes:

- `GET /health`
- `GET /api/stocks`
- `GET /api/screen`
- `GET /api/stocks/{ticker}`
- `GET /api/stocks/{ticker}/history`
- `GET/POST/DELETE /api/watchlist`

Watchlist data is stored locally in `backend/db/watchlist.db`, which is ignored by git.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend reads `NEXT_PUBLIC_API_URL`; for local development use:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Verification

From `frontend/`:

```bash
npm run lint
npm run build
```

From the repo root:

```bash
python -m compileall backend
```

A quick backend smoke test:

```bash
cd backend
python -c "from services.yfinance_service import get_stock_detail; d=get_stock_detail('BBCA.JK'); print(d['ticker'], d['price'], d['market_cap'])"
```

## Data Sources and Limitations

Yahoo Finance chart data works for `.JK` tickers and is used for price, volume, history, RSI, MACD, SMA, and EMA values.

Yahoo quoteSummary often returns 404 for `.JK` tickers. The backend therefore falls back to Yahoo fundamentals-timeseries for available fundamentals such as market cap, P/E, P/B, dividend yield, revenue, net income, assets, and debt. ROE remains `null` when Yahoo does not provide a reliable equity denominator.

This app is for screening and research workflows, not financial advice. Live data can be delayed, incomplete, rate-limited, or temporarily unavailable.

## Deployment Notes

- Backend includes `backend/railway.toml` for Railway-style FastAPI deployment.
- Frontend is Vercel-compatible and keeps `.vercel/` ignored.
- Set production `NEXT_PUBLIC_API_URL` to the deployed backend URL.
- Set backend `CORS_ORIGINS` to a comma-separated list of allowed frontend origins.

## Repository Hygiene

Ignored local/generated files include:

- Python caches and virtualenvs
- `backend/db/watchlist.db`
- `frontend/node_modules/`
- `frontend/.next/`
- `frontend/.vercel/`
- local env files
