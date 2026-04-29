# FineLedger Pro (Cloud-first Firebase build)

This build removes AI provider integrations and is focused on **Firebase cloud sync for ledger data**.

## What changed

- Removed AI API settings and AI insight features.
- Added a **Cloud Settings** tab with all Firebase client fields you need to connect at runtime:
  - API Key
  - Auth Domain
  - Project ID
  - Storage Bucket
  - Messaging Sender ID
  - App ID
  - Workspace ID
- Financial ledger data (`transactions`, `budgets`, `goals`, `currency`) is saved to **Firestore only**.
- Firebase config is entered in-app and saved in browser local storage so sensitive values are not committed to this repository.
- Added a prominent cloud status indicator so you can clearly see whether cloud sync is active.

## Run

Open `index.html` directly in your browser, or serve it as static files.

Example:

```bash
npx serve .
```

## Important notes

- You must create/configure your Firebase project and Firestore rules.
- Recommended strict Firestore rules for this app structure:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Workspace data is private per signed-in user.
    match /fineledgerWorkspaces/{workspaceId}/users/{userId}/data/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

- If cloud is disconnected, the app blocks finance writes.
- This build does **not** persist financial data locally.
