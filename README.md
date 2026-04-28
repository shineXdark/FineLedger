# FineLedger Pro (Public-safe local build)

This build removes external API usage so the repository can be safely public.

## What changed

- No Firebase authentication or Firestore sync.
- No backend server and no AI provider integration.
- No API keys or secret environment variables required.
- App data is saved in browser `localStorage` only.

## Run

Open `index.html` directly in your browser, or serve it as static files.

Example:

```bash
npx serve .
```

## Notes

- Data is stored locally per browser/profile.
- Clearing browser storage clears app data.
- If you previously used secret keys, rotate/revoke them in provider dashboards.
