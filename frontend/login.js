// Create the main MSAL instance
console.log("MSAL Config:", msalConfig);
const msalInstance = new msal.PublicClientApplication(msalConfig);

// Function to handle the login process
function signIn() {
    console.log("Login Request:", loginRequest);
    msalInstance.loginRedirect(loginRequest).catch(e => {
        console.error(`Login Error: ${e.errorCode} - ${e.errorMessage}`);
        console.error(e);
    });
}

// Function to handle the logout process
function signOut() {
    msalInstance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
    });
}

// Handle the redirect promise when the page loads
msalInstance.handleRedirectPromise()
    .then(response => {
        if (response) {
            console.log("Login successful! Redirecting to dashboard...");
            // On successful login, redirect to the main page or dashboard
            window.location.href = '/index.html';
        } else {
            // Check if there are any accounts in the cache
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                console.log("User is already signed in. Redirecting...");
                window.location.href = '/index.html';
            }
        }
    })
    .catch(err => {
        console.error(err);
    });

