# YouTube Publishing — One-time Setup Guide

The **📤 Publish** button uploads the generated video straight to a YouTube channel from the
browser. To enable it you need a free Google Cloud **OAuth Client ID** (a public identifier,
not a secret). This takes ~15 minutes and costs nothing.

## 1. Create the Google Cloud project

1. Go to <https://console.cloud.google.com/> and sign in.
2. Top bar → project selector → **New Project** → name it (e.g. `TopRankVids`) → Create.

## 2. Enable the YouTube Data API v3

1. Menu → **APIs & Services → Library**.
2. Search **YouTube Data API v3** → **Enable**.

## 3. Configure the OAuth consent screen

1. **APIs & Services → OAuth consent screen**.
2. User type: **External** → Create.
3. Fill the minimum: app name (`TopRankVids`), your email as support + developer contact. Save.
4. **Scopes**: you can skip adding scopes here (the app requests them at runtime).
5. **Test users**: add the Google account(s) that will publish (your own email!).
   While the app is in *Testing* mode, **only these accounts can sign in** (max 100).

## 4. Create the OAuth Client ID

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized JavaScript origins** — add both:
   - `https://<your-username>.github.io` (your GitHub Pages origin — no path!)
   - `http://localhost:8123` (for local testing with `serve.ps1`)
4. Leave redirect URIs empty (not needed for the token flow). Create.
5. Copy the **Client ID** (ends in `.apps.googleusercontent.com`).

## 5. Plug it into the app

Open `js/config.js` and paste it:

```js
window.TRV_CONFIG = {
  googleClientId: '1234567890-abcdefg.apps.googleusercontent.com'
};
```

Commit/push (GitHub Pages) o ricarica in locale. La sezione **Publishing** nell'editor ora
mostra "Connect YouTube".

## Limits you should know

- **Quota**: uploading one video costs 1600 of the project's 10 000 daily units → **~6 uploads
  per day, shared by every user of your Client ID**. You can request a quota increase from
  Google (requires an audit).
- **Testing mode**: only your registered test users can sign in. To open the app to everyone
  you must submit the app for **Google verification** (public privacy policy, homepage, demo
  video; takes weeks). No code changes needed — it's purely an admin process on the consent
  screen page ("Publish app" + verification).
- **Session**: the access token lives ~1 hour in memory. The app silently renews it when
  publishing; a Google popup may occasionally reappear.
- **Shorts**: there is no "Shorts" API flag — vertical videos (1080×1920) under 3 minutes are
  classified as Shorts automatically. The default `#Shorts` description helps discovery.
- **Copyright**: publishing clips/audio you don't own can trigger claims on your channel.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Publishing is not configured" in the app | `googleClientId` is empty in `js/config.js` |
| Popup: *access blocked / app not verified* | Add your account under **Test users** (step 3.5) |
| Popup error `origin_mismatch` | The page origin isn't listed in **Authorized JavaScript origins** (step 4.3) — exact match, no trailing slash |
| `Daily YouTube upload quota reached` | Wait until the quota resets (midnight Pacific Time) |
| Sign-in popup never appears | Popup blocker or ad-blocker blocking `accounts.google.com/gsi/client` |
