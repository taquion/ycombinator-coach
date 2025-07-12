const msalConfig = {
    auth: {
        clientId: "1f9e42ba-8de3-42a2-ab9f-0f72ac5474c0",
        authority: "https://ycoachapp.ciamlogin.com/ycoachapp.onmicrosoft.com/", // Correct authority based on working endpoint
        knownAuthorities: ["ycoachapp.ciamlogin.com"],
        redirectUri: "https://polite-plant-0f3f4a41e.2.azurestaticapps.net/", // Match the working redirect URI from Azure test
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};


const loginRequest = {
    scopes: ["openid"]
};
