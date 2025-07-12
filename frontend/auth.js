// frontend/auth.js



// Function to handle the logout process
function signOut() {
    const account = msalInstance.getAccountByUsername(sessionStorage.getItem("msal_username"));
    msalInstance.logoutRedirect({
        account: account,
        postLogoutRedirectUri: window.location.origin,
    });
}

// Function to update the UI based on authentication state
function updateUI(account) {
    const userSessionControls = document.getElementById('user-session-controls');

    if (account) {
        // User is signed in
        sessionStorage.setItem("msal_username", account.username); // Store username for logout
        
        // Use name if available, otherwise fallback to username
        const displayName = account.name || account.username.split('@')[0];

        userSessionControls.innerHTML = `
            <span class="text-sm text-gray-700">Welcome, ${displayName}</span>
            <button onclick="signOut()" class="ml-4 px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600">Sign Out</button>
        `;
    } else {
        // User is not signed in
        userSessionControls.innerHTML = `
            <a href="login.html" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-orange-600">Login</a>
            <a href="login.html" class="ml-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600">Sign Up</a>
        `;
    }
}


// Main logic to run when the page loads
function initializeAuth() {
    msalInstance.handleRedirectPromise().then(response => {
        if (response && response.account) {
            return response.account;
        } else {
            const currentAccounts = msalInstance.getAllAccounts();
            if (currentAccounts.length === 0) {
                // No user is signed in, redirect to login page
                console.log("No active session found. Redirecting to login.");
                window.location.href = 'login.html';
                return null;
            } else {
                return currentAccounts[0];
            }
        }
    }).then(account => {
        if (account) {
            console.log("Account object received:", account); // Diagnostic log
            console.log("Account is set, attempting to acquire token silently.");
            msalInstance.setActiveAccount(account);
            // Silently acquire token to get user's name from 'profile' scope
            msalInstance.acquireTokenSilent({
                ...tokenRequest,
                account: account
            }).then(response => {
                // The response.account object now contains the user's name
                updateUI(response.account);
            }).catch(error => {
                console.error("Silent token acquisition failed: ", error);
                // Fallback to updating UI with whatever info we have
                updateUI(account);
            });
        }
    }).catch(err => {
        console.error(err);
        // Redirect to login on error as a fallback
        window.location.href = 'login.html';
    });
}

// Run the authentication check as soon as the DOM is ready
document.addEventListener('DOMContentLoaded', initializeAuth);
