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
function updateUI() {
    const userSessionControls = document.getElementById('user-session-controls');
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length > 0) {
        // User is signed in
        const account = accounts[0];
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
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
        // No user is signed in, redirect to login page
        console.log("No active session found. Redirecting to login.");
        window.location.href = 'login.html';
    } else {
        // User is signed in, set the active account and update the UI
        msalInstance.setActiveAccount(accounts[0]);
        updateUI();
    }
}

// Run the authentication check as soon as the DOM is ready
document.addEventListener('DOMContentLoaded', initializeAuth);
