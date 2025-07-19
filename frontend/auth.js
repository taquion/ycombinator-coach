// frontend/auth.js



// Function to handle the login process using a popup
function signIn() {
    msalInstance.loginPopup(loginRequest)
        .then(handleResponse)
        .catch(error => {
            console.error("Login popup failed: ", error);
        });
}

// Function to handle the sign-out process
function signOut() {
    const account = msalInstance.getAccountByUsername(sessionStorage.getItem("msal_username"));
    const logoutRequest = {
        account: account,
        postLogoutRedirectUri: window.location.origin,
    };
    msalInstance.logoutRedirect(logoutRequest);
}

// Function to update the UI based on authentication state
function updateUI(account) {
    const userSessionControls = document.getElementById('user-session-controls');
    const foundersContainer = document.getElementById('founders-container');

    if (account) {
        // --- User is signed in ---
        if (foundersContainer) foundersContainer.classList.remove('hidden');

        // Display welcome message and sign-out button in the header
        const welcomeMessage = `
            <div class="text-right">
                <p class="text-sm text-gray-600">Welcome, ${account.username || account.name}</p>
                <button onclick="signOut()" class="text-sm font-semibold text-orange-600 hover:text-orange-500">Sign Out</button>
            </div>`;
        if (userSessionControls) userSessionControls.innerHTML = welcomeMessage;

        // Special logic for the admin user to see founders
        if (account.username.toLowerCase() === 'dnader90@gmail.com') {
            populateFounders(account);
        } else {
            if (foundersContainer) foundersContainer.innerHTML = ''; // Clear for others
        }

    } else {
        // --- User is not signed in ---
        if (foundersContainer) foundersContainer.classList.add('hidden');

        // Display sign-in button in the header
        const signInButton = `
            <button onclick="signIn()" class="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-300">
                Sign In or Sign Up
            </button>`;
        if (userSessionControls) userSessionControls.innerHTML = signInButton;
    }
}

function populateFounders(account) {
    const foundersList = document.getElementById('founders-list');
    if (!foundersList) return;

    // ALWAYS clear existing content first to prevent data leakage to new users.
    foundersList.innerHTML = '';

    // Only populate for the specific admin user
    if (account && account.username === 'dnader90@gmail.com') {
        const founderData = [
            { name: 'Juan Perez', status: 'Profile complete' },
            { name: 'Brenda Smith', status: 'Profile complete' }
        ];

        founderData.forEach(founder => {
            const founderCardHTML = `
                <div class="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="font-semibold text-gray-800">${founder.name}</h3>
                        <p class="text-sm text-green-600">${founder.status}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="text-gray-400 hover:text-gray-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                        </button>
                        <button class="text-gray-400 hover:text-red-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            `;
            foundersList.innerHTML += founderCardHTML;
        });
    }
}


// Main logic to run when the page loads
function initializeAuth() {
    msalInstance.handleRedirectPromise()
        .then(handleResponse)
        .catch(error => {
            console.error("Redirect promise failed: ", error);
            // Even if promise fails, check for existing accounts and update UI
            selectAccount();
        });
}

/**
 * Handles the response from a redirect or popup. If a response is provided, it sets the active account.
 * Then, it calls selectAccount to find and refresh the UI for the active account.
 * @param {import("@azure/msal-browser").AuthenticationResult} response 
 */
function handleResponse(response) {
    if (response !== null) {
        msalInstance.setActiveAccount(response.account);
    }
    selectAccount();
}

/**
 * Checks for active accounts and updates the UI accordingly.
 */
function selectAccount() {
    const currentAccount = msalInstance.getActiveAccount();
    if (!currentAccount) {
        const allAccounts = msalInstance.getAllAccounts();
        if (allAccounts.length > 0) {
            // If no active account is set, but there are accounts, set the first one.
            msalInstance.setActiveAccount(allAccounts[0]);
        }
    }
    updateUI(msalInstance.getActiveAccount());
}

// Run the authentication check as soon as the DOM is ready
document.addEventListener('DOMContentLoaded', initializeAuth);
