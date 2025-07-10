document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOM fully loaded and parsed');

    // --- UI Elements ---
    const pitchForm = document.getElementById('pitchForm');
    const pitchResultDiv = document.getElementById('pitchResult');
    const conversationDiv = document.getElementById('conversation');
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
    initializeBusinessInfo();
    setupCountdown();
    setupScrollSpy();
    document.getElementById('add-cofounder-btn').addEventListener('click', addFounder);

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

        // Founders Section Textareas
        document.querySelector('textarea[name="technicalWork"]').value = 'Alex is responsible for all backend development and AI model integration. Brenda handles frontend UI/UX and business logic implementation.';
        document.querySelector('textarea[name="lookingForCofounder"]').value = 'No, our founding team is set.';
    }

    // --- Founder Management ---
    function initializeFounders() {
        const storedFounders = localStorage.getItem(foundersKey);
        // Check if there's meaningful data, not just an empty array string '[]'
        if (storedFounders && storedFounders.length > 2) { 
            founders = JSON.parse(storedFounders);
        } else {
            // Start with two default co-founders for testing
            founders = [
                {
                    id: 1,
                    name: 'Alex Chen',
                    title: 'CEO & Lead Engineer',
                    email: 'alex.chen@example.com',
                    equity: '50',
                    technical: 'Yes',
                    linkedin: 'https://linkedin.com/in/alexchen-mock',
                    status: 'complete',
                    education: [
                        { id: 1, school: 'Stanford University', degree: 'M.S. in Computer Science', 'edu-dates': '2018 - 2020' }
                    ],
                    work: [
                        { id: 1, 'company-title': 'Google / Software Engineer', 'work-dates': '2020 - 2024' }
                    ]
                },
                {
                    id: 2,
                    name: 'Brenda Smith',
                    title: 'COO & Head of Sales',
                    email: 'brenda.smith@example.com',
                    equity: '50',
                    technical: 'No',
                    linkedin: 'https://linkedin.com/in/brendasmith-mock',
                    status: 'complete',
                    education: [
                        { id: 1, school: 'Harvard Business School', degree: 'MBA', 'edu-dates': '2017 - 2019' }
                    ],
                    work: [
                        { id: 1, 'company-title': 'McKinsey & Company / Business Analyst', 'work-dates': '2019 - 2024' }
                    ]
                }
            ];
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

        try {
            console.log('DEBUG: Sending request to /api/evaluate_pitch...');
            const response = await fetch('/api/evaluate_pitch', {
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
            startConversation(result.first_question);

        } catch (error) {
            console.error('DEBUG: CATCH block - Error during fetch:', error);
            displayError(error.message);
        } finally {
            showLoading(false);
        }
    });

    // --- Conversation Logic ---
    function startConversation(firstQuestion) {
        console.log('DEBUG: Starting conversation');
        round = 1;
        updateConversationUI(firstQuestion, 'assistant');
        conversationHistory.push({ role: 'assistant', content: firstQuestion });
        addUserInput();
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
                const response = await fetch('/api/refine_pitch', {
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
            const response = await fetch('/api/generate_summary', {
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