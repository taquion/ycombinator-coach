

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
        if (response && response.account) {
            console.log("Redirect promise handled successfully. Setting active account.");
            msalInstance.setActiveAccount(response.account);
            console.log("Login successful! Redirecting to dashboard...");
            window.location.href = '/index.html';
        } else {
            // Fallback check for existing sessions
            const currentAccounts = msalInstance.getAllAccounts();
            if (currentAccounts.length > 0) {
                console.log("User is already signed in. Redirecting...");
                msalInstance.setActiveAccount(currentAccounts[0]);
                window.location.href = '/index.html';
            }
        }
    })
    .catch(err => {
        console.error(err);
    });

