const msalConfig = {
    auth: {
        clientId: "1f9e42ba-8de3-42a2-ab9f-0f72ac5474c0",
        authority: "https://ycoachapp.ciamlogin.com/ycoachapp.onmicrosoft.com/", // Correct authority based on working endpoint
        knownAuthorities: ["ycoachapp.ciamlogin.com"],
        redirectUri: "https://polite-plant-0f3f4a41e.2.azurestaticapps.net/login.html", // Set exact redirect URI from Azure
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};


const loginRequest = {
    scopes: ["openid", "profile", "offline_access", "api://1a8a64c8-4d5a-4426-82e3-2b2c01552599/access_as_user"]
};
