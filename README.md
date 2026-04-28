# FineLedger Pro

FineLedger Pro is a single-page budget system with:
- Google sign-in (Firebase Auth)
- Real-time transaction ledger (Firestore)
- Savings goals tracker
- Monthly category budgets with health indicators
- KPI dashboard + charts
- Optional Gemini insight generation

## Why this solves your previous workflow issue
You **do not** need VS Code Live Server.
Host this app on any static hosting provider and open its HTTPS URL:
- Firebase Hosting (recommended)
- Netlify
- Vercel
- GitHub Pages

Once hosted, Google OAuth + Firestore work from the live URL.

## Setup

### 1) Add your runtime config
Before the module script in `index.html`, inject config like:

```html
<script>
  window.FINELEDGER_CONFIG = {
    firebase: {
      apiKey: "...",
      authDomain: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "..."
    },
    geminiApiKey: "OPTIONAL"
  };
</script>
```

You can keep this in a separate file if you prefer.

### 2) Firebase console checks
- Enable **Authentication > Google provider**.
- Enable **Authentication > Email/Password** (for password sign-in + account creation).
- Enable **Authentication > Email link (passwordless sign-in)** if you want magic-link login.
- Create Firestore database.
- Add authorized domain(s) for your deployed site.

If you see `auth/unauthorized-domain`:
- Go to **Firebase Console → Authentication → Settings → Authorized domains**.
- Add the exact host you are opening the app from (for example `localhost`, `127.0.0.1`, or `your-site.web.app`).
- Confirm your runtime config points to the same Firebase project where you added the domain.

### 3) Firestore rules (starter)
Use this as a secure baseline and adjust to your needs:

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

## Deploy quickly with Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Use:
- public directory = `.`
- single-page app rewrite = `n`

## Data model
- `users/{uid}/transactions/{id}`
- `users/{uid}/goals/{id}`
- `users/{uid}/budgets/{category}`

## Notes
- Currency is currently USD in UI formatting; adjust in `money()` function.
- Gemini insights are optional and disabled automatically when no API key is provided.
- `file://` cannot be added as a Firebase Google OAuth authorized domain. Use **Continue without Google** (anonymous Firebase auth) for local runs, or host the app on an authorized HTTPS domain for Google sign-in.
