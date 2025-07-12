/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: "1f9e42ba-8de3-42a2-ab9f-0f72ac5474c0", // Client ID of your frontend app registration
        authority: "https://ycoachapp.ciamlogin.com/ycoachapp.onmicrosoft.com/B2C_1_susi", // Specify the sign-up/sign-in user flow
        knownAuthorities: ["ycoachapp.ciamlogin.com"], // Mark the authority as a known domain
        redirectUri: window.location.origin, // Let MSAL handle the redirect URI dynamically
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) for Azure AD B2C user flows.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
const loginRequest = {
    scopes: ["openid", "profile", "offline_access", "api://a67d445d-15a2-44cb-ae27-3a7ec862e699/access_as_user"]
};

