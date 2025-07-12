// frontend/msal-init.js

// This script should be loaded after msal-browser.min.js and authConfig.js
// It creates a single, shared MSAL instance for the entire application.

const msalInstance = new msal.PublicClientApplication(msalConfig);
