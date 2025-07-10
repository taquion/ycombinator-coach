document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    const toggleText = document.getElementById('toggle-text');

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
            formTitle.textContent = 'Create a New Account';
            submitButton.textContent = 'Sign Up';
            toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link" class="font-medium text-orange-600 hover:text-orange-500">Login</a>`;
        }
        setupToggleLink();
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const endpoint = isLoginMode ? '/api/login_user' : '/api/signup_user';
        const actionText = isLoginMode ? 'Logging in...' : 'Signing up...';

        submitButton.disabled = true;
        submitButton.textContent = actionText;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                if (isLoginMode) {
                    window.location.href = '/index.html';
                } else {
                    // Switch to login mode after successful signup
                    isLoginMode = true;
                    updateFormUI();
                }
            } else {
                alert(`Error: ${result.message || 'An unknown error occurred.'}`);
            }
        } catch (error) {
            console.error('Error during form submission:', error);
            alert('An error occurred. Please try again.');
        } finally {
            submitButton.disabled = false;
            updateFormUI(); // Reset button text and link
        }
    });

    // Initial setup
    updateFormUI();
});
