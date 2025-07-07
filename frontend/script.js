document.addEventListener('DOMContentLoaded', () => {
  console.log('DEBUG: DOM fully loaded and parsed.');

  let conversationHistory = [];
  let originalPitch = {};
  let round = 0;

  const pitchForm = document.getElementById('pitchForm');
  const pitchResultDiv = document.getElementById('pitchResult');
  const rubricTableBody = document.getElementById('rubricTableBody');
  const conversationDiv = document.getElementById('conversation');
  const submitButton = pitchForm.querySelector('button[type="submit"]');

  // Main form submission
  pitchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('DEBUG: "Generate My Pitch" button clicked.');

    showLoading(true);
    resetUI();
    
    const formData = new FormData(pitchForm);
    originalPitch = {
      startupName: formData.get('startupName'),
      oneLiner: formData.get('oneLiner'),
      problem: formData.get('problem'),
      solution: formData.get('solution'),
      team: formData.get('team'),
      traction: formData.get('traction'),
    };
    console.log('DEBUG: Form data collected:', originalPitch);

    try {
      console.log('DEBUG: Sending request to /api/evaluate_pitch...');
      const response = await fetch('/api/evaluate_pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(originalPitch),
      });
      console.log('DEBUG: Received response from fetch.');


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        console.error('DEBUG: API response not OK.', { status: response.status, errorData });
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('DEBUG: Successfully parsed JSON response from /api/evaluate_pitch:', result);

      conversationHistory = [{ role: 'assistant', content: result.first_question }];
      round = 1;
      displayEvaluation(result);

    } catch (error) {
      console.error('DEBUG: CATCH block - Error during evaluation fetch:', error);
      displayError(error.message);
    } finally {
      console.log('DEBUG: FINALLY block - Evaluation fetch finished.');
      showLoading(false);
    }
  });

  // Handles the conversational back-and-forth
  async function handleUserResponse() {
    console.log('DEBUG: handleUserResponse function called.');
    const userResponseInput = document.getElementById('userResponse');
    const userResponseText = userResponseInput.value;
    if (!userResponseText) {
        console.log('DEBUG: User response is empty. Aborting.');
        return;
    }
    console.log('DEBUG: User response captured:', userResponseText);


    // Disable form while processing
    const sendBtn = document.getElementById('sendResponseBtn');
    userResponseInput.disabled = true;
    if(sendBtn) sendBtn.disabled = true;

    conversationHistory.push({ role: 'user', content: userResponseText });
    updateConversationUI(userResponseText, 'user');

    if (round < 3) {
      round++;
      try {
        console.log('DEBUG: Sending request to /api/refine_pitch...');
        const response = await fetch('/api/refine_pitch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: conversationHistory, pitch: originalPitch }),
        });
        console.log('DEBUG: Received response from fetch.');

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
          console.error('DEBUG: API response not OK.', { status: response.status, errorData });
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('DEBUG: Successfully parsed JSON response from /api/refine_pitch:', result);
        conversationHistory.push({ role: 'assistant', content: result.next_question });
        updateConversationUI(result.next_question, 'assistant');

      } catch (error) {
        console.error('DEBUG: CATCH block - Error during refine_pitch fetch:', error);
        displayError(error.message);
      }
    } else {
      console.log('DEBUG: Max rounds reached. Generating final summary message.');
      updateConversationUI('Thank you. Based on our conversation, I will now generate the final summary.', 'assistant');
      // Future: call generate_summary API
    }
  }
  
  // --- UI HELPER FUNCTIONS ---

  function resetUI() {
    console.log('DEBUG: Resetting UI.');
    pitchResultDiv.classList.add('hidden');
    rubricTableBody.innerHTML = '';
    conversationDiv.innerHTML = '';
    conversationHistory = [];
    round = 0;
  }

  function displayEvaluation(result) {
    console.log('DEBUG: Displaying evaluation results.');
    result.evaluation.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.area}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.rating}</td>`;
      rubricTableBody.appendChild(row);
    });

    updateConversationUI(result.first_question, 'assistant');
    pitchResultDiv.classList.remove('hidden');
    pitchResultDiv.scrollIntoView({ behavior: 'smooth' });
  }

  function updateConversationUI(text, role) {
    console.log(`DEBUG: Updating conversation UI for role: ${role}`);
    const messageContainer = document.createElement('div');

    if (role === 'user') {
      const userInputArea = conversationDiv.querySelector('.user-input-area');
      if (userInputArea) {
        userInputArea.innerHTML = `<div class="p-4 bg-blue-100 text-blue-800 border border-blue-200 rounded-md my-4"><strong>You:</strong><p class="mt-1">${text}</p></div>`;
      }
    } else {
      let html = `
        <div class="mt-6 p-4 border rounded-lg bg-gray-50 ai-message">
          <p class="font-semibold text-gray-800">AI Coach:</p>
          <p class="mt-2 text-gray-700">${text}</p>
        </div>
      `;
      // Check if it's the end of the conversation
      if (round < 3 && !text.startsWith('Thank you')) {
        html += `
          <div class="mt-4 user-input-area">
            <textarea id="userResponse" class="w-full p-2 border rounded-md" placeholder="Your answer..."></textarea>
            <button id="sendResponseBtn" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Send</button>
          </div>
        `;
      }
      messageContainer.innerHTML = html;
      conversationDiv.appendChild(messageContainer);

      if (round < 3 && !text.startsWith('Thank you')) {
        const sendBtn = document.getElementById('sendResponseBtn');
        if (sendBtn) {
            console.log('DEBUG: Adding event listener to new "Send" button.');
            sendBtn.addEventListener('click', handleUserResponse);
        } else {
            console.error('DEBUG: Could not find "Send" button to attach listener.');
        }
      }
    }
    messageContainer.scrollIntoView({ behavior: 'smooth' });
  }

  function displayError(message) {
    console.log('DEBUG: Displaying error message:', message);
    conversationDiv.innerHTML = `<div class="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md"><strong>Error:</strong> ${message}</div>`;
    pitchResultDiv.classList.remove('hidden');
    pitchResultDiv.scrollIntoView({ behavior: 'smooth' });
  }

  function showLoading(isLoading) {
    console.log(`DEBUG: Setting loading state to: ${isLoading}`);
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Evaluating...`;
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Generate My Pitch';
    }
  }
});