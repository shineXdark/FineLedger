# FineLedger

FineLedger is a cloud-first personal finance ledger that stores your financial data in **Google Firestore** under your own Firebase project.

It is designed for people who want simple transaction tracking, budgeting, and goals with account-based cloud sync (Google sign-in), without running a backend server for the app itself.

---

## Overview

FineLedger focuses on a practical workflow:

- Track transactions
- Manage budgets and goals
- Keep currency preferences
- Sync data securely to Firestore per signed-in user and workspace

All ledger data is written to a user-scoped document path:

- `/fineledgerWorkspaces/{workspaceId}/users/{uid}/data/ledger`

---

## Pros and Cons

### Pros

- **Cloud-first sync**: Data is centralized in Firestore and tied to authenticated users.
- **No custom backend required**: You can host this as static files.
- **Runtime Firebase configuration**: Configure Firebase directly in the app UI.
- **Per-user isolation**: Firestore rules can enforce ownership by `request.auth.uid`.
- **Simple deployment**: Works from `index.html` or any static file hosting.

### Cons

- **Firebase setup required**: You must create and configure a Firebase project correctly.
- **Rules are critical**: Incorrect Firestore security rules can expose or block data.
- **Google sign-in dependency**: Core cloud write flow requires authenticated Google users.
- **No offline/local finance persistence in this build**: If cloud/auth is unavailable, finance writes are blocked.
- **Vendor coupling**: This build is tightly coupled to Firebase services.

---

## How to Make It Work (Setup Guide)

Follow these steps in order.

### 1) Get the project files

Clone or download this repository.

### 2) Run the app locally (static hosting)

Serve with a local static server (recommended) because parts of the app rely on secure-browser APIs.

Example:

```bash
npx serve .
```

Then open the local URL shown by the server.

### 3) Create/configure Firebase

In Firebase Console:

1. Create a Firebase project.
2. Enable **Authentication** with **Google** as a sign-in provider.
3. Create a **Firestore** database.
4. In **Project Settings** → your Web App config, copy:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### 4) Configure Firestore security rules

Use rules that only allow a signed-in user to read/write their own ledger document.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Block workspace user-list enumeration.
    match /fineledgerWorkspaces/{workspaceId}/users {
      allow list: if false;
    }

    // FineLedger writes exactly one document:
    // /fineledgerWorkspaces/{workspaceId}/users/{uid}/data/ledger
    match /fineledgerWorkspaces/{workspaceId}/users/{userId}/data/ledger {
      allow get, create, update, delete: if isOwner(userId);
    }

    // Deny everything else by default.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

If your app uses additional collections (for example a profile document), add explicit rules for those paths as needed.

### 5) Enter Firebase values in FineLedger

In the app:

1. Open **Cloud Settings**.
2. Paste the Firebase configuration fields.
3. Save/apply settings.
4. Sign in with Google.

Once connected, cloud status should show as active and data writes will be available.

---

## Data & Security Notes

- Firebase config values are entered at runtime and saved in browser local storage for convenience.
- Financial ledger data is intended to be stored in Firestore (cloud), not committed to this repository.
- Access control depends on your Firestore rules and authenticated user identity.

---

## FAQ

### 1) Why can’t I save transactions?
Most commonly:
- You are not signed in with Google.
- Cloud/Firebase settings are incomplete or incorrect.
- Firestore security rules do not allow your user path.

### 2) Can I use FineLedger without Firebase?
This build is cloud-first and expects Firebase/Firestore for finance data writes.

### 3) Where is my ledger stored?
In Firestore at:
`/fineledgerWorkspaces/{workspaceId}/users/{uid}/data/ledger`

### 4) Are my Firebase keys secret?
Web Firebase config values (like API key) are not treated as private credentials by themselves. Security should come from Authentication and Firestore rules.

### 5) Can multiple users share one workspace ID?
Yes, but each user’s data remains under their own `uid` path when rules enforce ownership.

### 6) What happens if cloud is disconnected?
In this build, finance writes are blocked when cloud/auth requirements are not met.

### 7) Do I need a backend server?
Not for basic hosting. You can deploy static files; Firebase provides auth/data services.

---

## Naming Note

The product name is **FineLedger**.
