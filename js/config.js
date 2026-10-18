// TopRankVids configuration.
//
// googleClientId — OAuth 2.0 Web Client ID from Google Cloud Console, used for
// the "Publish to YouTube" feature. It is a public identifier (not a secret).
// Leave empty to disable publishing. Setup guide: docs/YOUTUBE_SETUP.md
//
// publishing — false shows publishing as "coming soon": the section and the
// Publish button stay visible but can't be used. Set to true to turn it on.
window.TRV_CONFIG = {
  googleClientId: '',
  publishing: false
};
