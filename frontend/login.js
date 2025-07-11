document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    const toggleText = document.getElementById('toggle-text');
    const messageDiv = document.getElementById('message'); // Added this line

    let isLoginMode = true;

    function setupToggleLink() {
        const toggleLink = document.getElementById('toggle-link');
        toggleLink.addEventListener('click', (event) => {
            event.preventDefault();
            isLoginMode = !isLoginMode;
            updateFormUI();
        });
    }

    function updateFormUI() {
        if (isLoginMode) {
            formTitle.textContent = 'Login to Your Account';
            submitButton.textContent = 'Login';
            toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link" class="font-medium text-orange-600 hover:text-orange-500">Sign up</a>`;
        } else {
            formTitle.textContent = 'Create a new Account'; // Corrected typo
            submitButton.textContent = 'Sign Up';
            toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link" class="font-medium text-orange-600 hover:text-orange-500">Login</a>`;
        }
        // Re-attach event listener after innerHTML is changed
        setupToggleLink();
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const API_BASE_URL = 'https://ycoach-api-prod.azurewebsites.net';
        const url = isLoginMode ? `${API_BASE_URL}/api/login_user` : `${API_BASE_URL}/api/signup_user`;
        const actionText = isLoginMode ? 'Logging in...' : 'Signing up...';

        submitButton.disabled = true;
        submitButton.textContent = actionText;
        if(messageDiv) messageDiv.textContent = ''; // Clear previous messages

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const responseBody = await response.text();

            if (response.ok) {
                const result = JSON.parse(responseBody);
                alert(result.message || 'Success!');
                if (isLoginMode) {
                    window.location.href = '/index.html';
                } else {
                    isLoginMode = true;
                    updateFormUI();
                }
            } else {
                console.error(`Server error (status ${response.status}):`, responseBody);
                try {
                    const errorJson = JSON.parse(responseBody);
                    if(messageDiv) messageDiv.textContent = `Server Error: ${errorJson.message || responseBody}`;
                    alert(`Server Error: ${errorJson.message || responseBody}`);
                } catch (e) {
                    if(messageDiv) messageDiv.textContent = `Server Error: ${responseBody}`;
                    alert(`Server Error: ${responseBody}`);
                }
            }
        } catch (error) {
            console.error('Network or client-side error:', error);
            if(messageDiv) messageDiv.textContent = 'An error occurred. Please check your connection and try again.';
            alert('An error occurred. Please check your connection and try again.');
        } finally {
            submitButton.disabled = false;
            // updateFormUI() will reset the button text, which is what we want
            updateFormUI();
        }
    });

    // Initial setup
    updateFormUI();
});
