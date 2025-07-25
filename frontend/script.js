document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOM fully loaded and parsed');

    // --- UI Elements ---
    const pitchForm = document.getElementById('pitchForm');
    const pitchResultDiv = document.getElementById('pitchResult');
    const addFounderBtn = document.getElementById('add-cofounder-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const lastSavedTimestampEl = document.getElementById('last-saved-timestamp');
    const countdownContainer = document.getElementById('countdown-container');
    const sections = document.querySelectorAll('div[id]');
    const navLinks = document.querySelectorAll('div.sticky ul a');

    // --- State ---
    const foundersKey = 'ycAppFounders'; // Key for local storage
    let founders = [];
    let conversationHistory = [];
    let originalPitch = {};
    let round = 0;
    const maxRounds = 3;

    if (!pitchForm) {
        console.error('DEBUG: Critical error - pitchForm not found!');
        return;
    }

    // --- Initial Setup ---
    initializeFounders();
    // initializeBusinessInfo(); // Disabled to start with a clean form
    setupCountdown();
    setupScrollSpy();
    if (addFounderBtn) addFounderBtn.addEventListener('click', addFounder);
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', handleSaveProfileClick);
    restoreFormState(); // Restore form state on page load

    // --- Form State Management ---
    function saveFormState() {
        const formData = new FormData(pitchForm);
        const formObject = Object.fromEntries(formData.entries());
        sessionStorage.setItem('formState', JSON.stringify(formObject));
        console.log('DEBUG: Form state saved to sessionStorage.');
    }

    function restoreFormState() {
        const savedState = sessionStorage.getItem('formState');
        if (savedState) {
            const formObject = JSON.parse(savedState);
            for (const key in formObject) {
                const element = pitchForm.elements[key];
                if (element) {
                    if (element.type === 'radio') {
                        // Handle radio buttons
                        document.querySelector(`input[name="${key}"][value="${formObject[key]}"]`).checked = true;
                    } else {
                        element.value = formObject[key];
                    }
                }
            }
            console.log('DEBUG: Form state restored from sessionStorage.');
            // Optional: Clear the state after restoring to avoid re-populating on refresh
            // sessionStorage.removeItem('formState'); 
        }
    }

    // --- Mock Business Info ---
    function initializeBusinessInfo() {
        // Company
        document.getElementById('startupName').value = 'Innovate AI';
        document.getElementById('oneLiner').value = 'AI-powered customer support automation for SaaS.';
        document.getElementById('companyUrl').value = 'https://innovateai.dev';
        document.getElementById('productLink').value = 'https://demo.innovateai.dev';
        document.getElementById('productDescription').value = 'High-growth SaaS companies struggle with scaling customer support, leading to high costs and slow response times. Our platform provides a trainable AI chatbot that resolves over 80% of common support queries instantly, freeing up human agents for complex issues.';
        document.getElementById('locationDecision').value = 'We are a remote-first team but are open to moving to the Bay Area for the duration of the program.';

        // Progress
        document.getElementById('progressStatus').value = 'We have launched our MVP and onboarded 10 beta users who are providing regular feedback. We are seeing a 75% weekly retention rate among active users.';
        document.querySelector('input[name="users"][value="yes"]').checked = true;
        document.querySelector('input[name="revenue"][value="no"]').checked = true;
        document.getElementById('accelerators').value = 'None';

        // Idea
        document.getElementById('category').value = 'B2B';
        document.getElementById('otherIdeas').value = 'We also considered a version for e-commerce, but SaaS is our primary focus due to our team\'s background.';

        // Equity
        document.querySelector('input[name="legalEntity"][value="yes"]').checked = true;
        document.querySelector('input[name="investment"][value="no"]').checked = true;
        document.querySelector('input[name="fundraising"][value="no"]').checked = true;

        // Curious
        document.getElementById('whyYc').value = 'We believe YC\'s network and mentorship are unparalleled and will be critical for helping us scale our sales strategy and product.';
        document.getElementById('howHeard').value = 'Through the YC blog, podcasts, and several YC alumni who recommended we apply.';
    }

    // --- Founder Management ---
    function initializeFounders() {
        const storedFounders = localStorage.getItem(foundersKey);
        // Check if there's meaningful data, not just an empty array string '[]'
        if (storedFounders && storedFounders.length > 2) { 
            founders = JSON.parse(storedFounders);
        } else {
            // Start with an empty list of founders
            founders = [];
            localStorage.setItem(foundersKey, JSON.stringify(founders));
        }
        renderFounderList();
    }

    function renderFounderList() {
        const founderListEl = document.getElementById('founder-list');
        if (!founderListEl) return;
        founderListEl.innerHTML = ''; // Clear existing list

        founders.forEach(founder => {
            const founderCard = document.createElement('div');
            founderCard.className = 'founder-card bg-white p-4 rounded-lg border border-gray-200';
            founderCard.dataset.id = founder.id;

            const isComplete = founder.name && founder.email; // Simple check for completion

            founderCard.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="font-semibold">${founder.name || 'Founder'}</h3>
                        <span class="text-sm ${isComplete ? 'text-green-600' : 'text-red-500'}">${isComplete ? 'Profile complete' : 'Profile incomplete'}</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="founder-profile.html?id=${founder.id}" class="edit-profile-btn text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                        </a>
                        <button class="delete-founder-btn text-red-400 hover:text-red-600" data-id="${founder.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
            `;
            founderListEl.appendChild(founderCard);
        });

        // Add event listeners for the new delete buttons
        document.querySelectorAll('.delete-founder-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const founderId = event.target.dataset.id;
                deleteFounder(founderId);
            });
        });
    }

    function deleteFounder(founderId) {
        founders = founders.filter(f => f.id !== parseInt(founderId));
        localStorage.setItem(foundersKey, JSON.stringify(founders));
        renderFounderList();
    }

        function addFounder() {
        const newFounder = { 
            id: Date.now(), 
            name: '', 
            status: 'incomplete',
            education: [], // Ensure these are initialized
            work: []
        };

        // Add to the main list and save to local storage
        founders.push(newFounder);
        localStorage.setItem(foundersKey, JSON.stringify(founders));

        // Also save the specific new founder to session storage to avoid race conditions
        sessionStorage.setItem('newFounderProfile', JSON.stringify(newFounder));

        // Redirect to the new profile page
        window.location.href = `founder-profile.html?id=${newFounder.id}&new=true`;
    }

    // --- Countdown Timer --- 
    function setupCountdown() {
        if (!countdownContainer) return;
        const deadline = new Date('2025-08-04T20:00:00-07:00'); // Aug 04 at 8pm PT
        const now = new Date();
        const diffTime = deadline - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const daysText = countdownContainer.querySelector('p:first-child');
        if (daysText) {
            daysText.textContent = `${diffDays} days left`;
        }
    }

    // --- Sidebar Scrollspy --- 
    function setupScrollSpy() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('text-orange-600', 'font-semibold');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('text-orange-600', 'font-semibold');
                        }
                    });
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // --- Form Submission --- 
    pitchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('DEBUG: Form submitted');

        showLoading(true);
        pitchResultDiv.classList.remove('hidden');
        conversationDiv.innerHTML = ''; // Clear previous results
        conversationHistory = [];
        round = 0;

        const formData = new FormData(pitchForm);
        originalPitch = Object.fromEntries(formData.entries());

        // Append founder data to the pitch
        originalPitch.founders = founders;
        console.log('DEBUG: Original pitch data collected:', originalPitch);

        // Get the logged-in user's account from MSAL
        const account = msalInstance.getActiveAccount();

        // Ensure user is logged in before proceeding
        if (!account || !account.idTokenClaims) {
            displayError('You must be logged in to submit your application. Please use the login button.');
            showLoading(false);
            return; // Stop the submission
        }

        // Add the user's unique object ID to the request payload
        originalPitch.userId = account.idTokenClaims.oid;
        console.log(`DEBUG: Attaching userId ${originalPitch.userId} to the request.`);

        try {
            // Save the profile data first, without waiting for the response
            saveProfileData(originalPitch);

            console.log('DEBUG: Sending request to /api/evaluate_pitch...');
            const API_BASE_URL = 'https://ycoach-api-prod.azurewebsites.net';
            const response = await fetch(`${API_BASE_URL}/api/evaluate_pitch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(originalPitch),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('DEBUG: Successfully parsed JSON response:', result);
            startConversation(result.evaluation, result.first_question);

        } catch (error) {
            console.error('DEBUG: CATCH block - Error during fetch:', error);
            displayError(error.message);
        } finally {
            showLoading(false);
        }
    });

    // --- Conversation Logic ---
    function startConversation(evaluation, firstQuestion) {
        console.log('DEBUG: Starting conversation with evaluation:', evaluation);
        round = 1;

        // Create and display the evaluation table
        const evaluationHtml = `
            <div class="mb-6 p-4 border rounded-lg bg-gray-50">
                <h4 class="text-md font-semibold text-gray-700 mb-3">Initial Pitch Evaluation:</h4>
                <div class="space-y-3">
                    ${evaluation.map(item => `
                        <div class="p-3 border-l-4 ${getRatingColor(item.rating)} bg-white rounded-r-lg">
                            <p class="font-semibold text-gray-800">${item.area}: <span class="font-normal text-gray-600">${item.rating}</span></p>
                            <p class="text-sm text-gray-500 mt-1">${item.feedback}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        conversationDiv.innerHTML += evaluationHtml;

        // Display the first question
        updateConversationUI(firstQuestion, 'assistant');
        conversationHistory.push({ role: 'assistant', content: firstQuestion });
        addUserInput();
    }

    function getRatingColor(rating) {
        switch (rating) {
            case 'YC-Ready': return 'border-green-500';
            case 'Strong': return 'border-blue-500';
            case 'Basic': return 'border-yellow-500';
            case 'Not-Ready': return 'border-red-500';
            default: return 'border-gray-300';
        }
    }

    function addUserInput() {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'mt-4';
        inputContainer.innerHTML = `
      <textarea id="userResponse" class="w-full p-2 border border-gray-300 rounded-md" rows="3" placeholder="Your answer..."></textarea>
      <button id="sendResponse" class="mt-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">Send</button>
    `;
        conversationDiv.appendChild(inputContainer);
        document.getElementById('sendResponse').addEventListener('click', handleUserResponse);
    }

    async function handleUserResponse() {
        const userResponse = document.getElementById('userResponse').value;
        if (!userResponse) return;

        updateConversationUI(userResponse, 'user');
        conversationHistory.push({ role: 'user', content: userResponse });

        const inputContainer = document.getElementById('userResponse').parentElement;
        inputContainer.remove();

        if (round < maxRounds) {
            round++;
            try {
                const response = await fetch(`${API_BASE_URL}/api/refine_pitch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ history: conversationHistory, pitch: originalPitch }),
                });
                if (!response.ok) throw new Error('Failed to get next question.');
                const result = await response.json();
                updateConversationUI(result.next_question, 'assistant');
                conversationHistory.push({ role: 'assistant', content: result.next_question });
                addUserInput();
            } catch (error) {
                displayError(error.message);
            }
        } else {
            updateConversationUI('Thank you. Based on our conversation, I will now generate the final summary.', 'assistant');
            await generateFinalSummary();
        }
    }

    async function generateFinalSummary() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/generate_summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory, pitch: originalPitch }),
            });
            if (!response.ok) throw new Error('Failed to generate summary.');
            const result = await response.json();
            displaySummary(result.summary);
        } catch (error) {
            displayError(error.message);
        }
    }

    // --- Data Persistence --- 
    async function handleSaveProfileClick() {
        if (!saveProfileBtn) return;

        const originalText = saveProfileBtn.textContent;
        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = 'Saving...';

        const formData = new FormData(pitchForm);
        const profileData = Object.fromEntries(formData.entries());
        profileData.founders = founders; // Add founders data

        const account = msalInstance.getActiveAccount();
        if (!account || !account.idTokenClaims) {
            displayError('You must be logged in to save your profile.');
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = originalText;
            return;
        }
        if (account) {
            profileData.userId = account.idTokenClaims.oid;
            console.log(`DEBUG: [Save Button] Attaching userId ${profileData.userId} to the request.`);
        } else {
            console.error("DEBUG: User not authenticated, cannot save profile.");
            // Optional: Show an error to the user
            return; // Stop if no user is logged in
        }

        console.log('DEBUG: Final payload to be sent to backend:', JSON.stringify(profileData, null, 2));
    const success = await saveProfileData(profileData);

        if (success) {
            saveProfileBtn.textContent = 'Saved!';
            updateLastSavedTimestamp();
        } else {
            saveProfileBtn.textContent = 'Save Failed';
            saveProfileBtn.classList.remove('bg-gray-500', 'hover:bg-gray-600');
            saveProfileBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        }

        setTimeout(() => {
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = originalText;
            if (!success) {
                saveProfileBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
                saveProfileBtn.classList.add('bg-gray-500', 'hover:bg-gray-600');
            }
        }, 2000);
    }

    async function saveProfileData(profileData) {
        try {
            console.log('DEBUG: Sending request to /api/save_profile...');
            const API_BASE_URL = 'https://ycoach-api-prod.azurewebsites.net'; 
            const response = await fetch(`${API_BASE_URL}/api/save_profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorText = await response.text(); // Get raw text for more details
                console.error(`DEBUG: Failed to save profile. Status: ${response.status}. Response: ${errorText}`);
                return false;
            } else {
                console.log('DEBUG: Profile data saved successfully.');
                return true;
            }
        } catch (error) {
            console.error('DEBUG: CATCH block - Error during profile save:', error);
            return false;
        }
    }

    function updateLastSavedTimestamp() {
        if (!lastSavedTimestampEl) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        lastSavedTimestampEl.textContent = `Last saved: ${timeString}`;
    }

    // --- UI Update Functions ---
    function updateConversationUI(message, role) {
        const messageDiv = document.createElement('div');
        const bubbleClass = role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
        const alignment = role === 'user' ? 'text-right' : 'text-left';
        messageDiv.className = `w-full ${alignment} mb-4`;
        messageDiv.innerHTML = `<div class="inline-block ${bubbleClass} rounded-lg px-4 py-2 max-w-xl">${message.replace(/\n/g, '<br>')}</div`;
        conversationDiv.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }

    function displayError(errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mt-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg';
        errorDiv.textContent = `Error: ${errorMessage}`;
        conversationDiv.appendChild(errorDiv);
    }

    function displaySummary(summaryMarkdown) {
        const summaryHtml = summaryMarkdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'mt-6';
        summaryContainer.innerHTML = `
        <h4 class="text-lg font-semibold text-gray-800">Your Refined Pitch</h4>
        <div class="mt-2 p-4 border rounded-lg bg-green-50 text-green-800">
            ${summaryHtml}
        </div>
      `;
        conversationDiv.appendChild(summaryContainer);
        summaryContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function showLoading(isLoading) {
        const button = document.querySelector('footer button[type="submit"]');
        if (button) {
            if (isLoading) {
                button.disabled = true;
                button.textContent = 'Getting Feedback...';
            } else {
                button.disabled = false;
                button.textContent = 'Get Feedback';
            }
        }
    }
});