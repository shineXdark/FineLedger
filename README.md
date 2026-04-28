# FineLedger Pro

FineLedger Pro is a budgeting dashboard with:
- Firebase Auth (Google)
- Firestore-backed ledger, goals, and budgets
- Dashboard KPIs + charts
- Optional AI insights through a **secure backend proxy**

## Security-first architecture

This repo now separates public client config from server secrets:

- `index.html` (browser client) uses `window.FINELEDGER_CONFIG` for Firebase public config and backend URL.
- `server/server.js` is a backend API layer that stores sensitive keys in environment variables.
- `.env` (local only, never commit) holds secrets like `GEMINI_API_KEY`.

This prevents exposing sensitive provider keys in browser code.

## Project files to create locally (do not commit secrets)

1. Copy `.env.example` to `.env` and fill your real values.
2. Copy `config.example.js` to `config.local.js` and fill your Firebase config.
3. Load `config.local.js` before `index.html` module script.

Example snippet to add in `index.html` before the module script:

```html
<script src="./config.local.js"></script>
```

## Install and run

```bash
npm install
npm run start
```

Server starts at `http://localhost:8787` by default.

## Backend hardening included

`server/server.js` includes:
- `helmet` secure headers
- `express-rate-limit` to reduce abuse
- strict request size cap
- CORS allowlist via `ALLOWED_ORIGINS`
- `x-powered-by` disabled
- validation for request payload shape

## Frontend runtime config

Use this shape:

```js
window.FINELEDGER_CONFIG = {
  firebase: {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  },
  apiBaseUrl: "http://localhost:8787"
};
```

## Firestore rules baseline

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Important deployment notes

- Firebase `apiKey` is a public client identifier, not a private secret.
- Gemini API key **must remain server-side only**.
- In production, set `ALLOWED_ORIGINS` to your exact deployed frontend origin(s).
- Use HTTPS for frontend and backend.

## GitHub Pages publishing fix

If your Pages URL shows a 404 page, add GitHub Actions as the publishing source.
This repo now includes `.github/workflows/deploy-pages.yml` which deploys `index.html` from the repo root whenever `main` is updated.

After pushing to GitHub:
1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Re-run the **Deploy static site to GitHub Pages** workflow if needed.

Then wait 1-2 minutes and refresh your Pages URL.
