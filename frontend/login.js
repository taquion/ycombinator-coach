document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        try {
            const response = await fetch('/api/login_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Login successful:', result);
                // For now, we'll just log the success message.
                // In the future, we'll handle session tokens and redirection here.
                alert(result.message);
                window.location.href = '/index.html'; // Redirect to main page on success
            } else {
                console.error('Login failed:', result);
                alert(`Error: ${result.message || 'An unknown error occurred.'}`);
            }

        } catch (error) {
            console.error('An error occurred during login:', error);
            alert('An error occurred. Please check the console for details.');
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
});
