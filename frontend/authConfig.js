const msalConfig = {
    auth: {
        clientId: "1f9e42ba-8de3-42a2-ab9f-0f72ac5474c0",
        authority: "https://ycoachapp.ciamlogin.com/ycoachapp.onmicrosoft.com/", // Correct authority based on working endpoint
        knownAuthorities: ["ycoachapp.ciamlogin.com"],
        redirectUri: window.location.origin + "/blank.html", // Use a blank page for popups
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};


const loginRequest = {
    scopes: ["openid"]
};

const tokenRequest = {
    scopes: ["profile", "offline_access"]
};
