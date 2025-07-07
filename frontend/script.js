document.addEventListener('DOMContentLoaded', () => {
  const pitchForm = document.getElementById('pitchForm');
  const pitchResultDiv = document.getElementById('pitchResult');
  const rubricTableBody = document.getElementById('rubricTableBody');
  const conversationDiv = document.getElementById('conversation');
  const submitButton = pitchForm.querySelector('button[type="submit"]');

  pitchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(true);
    pitchResultDiv.classList.add('hidden');
    rubricTableBody.innerHTML = '';
    conversationDiv.innerHTML = '';

    const formData = new FormData(pitchForm);
    const data = {
      startupName: formData.get('startupName'),
      oneLiner: formData.get('oneLiner'),
      problem: formData.get('problem'),
      solution: formData.get('solution'),
      team: formData.get('team'),
      traction: formData.get('traction'),
    };

    try {
      const response = await fetch('/api/evaluate_pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      displayEvaluation(result);

    } catch (error) {
      console.error('Error during evaluation:', error);
      displayError(error.message);
    } finally {
      showLoading(false);
    }
  });

  function displayEvaluation(result) {
    // Populate rubric table
    result.evaluation.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.area}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.rating}</td>
      `;
      rubricTableBody.appendChild(row);
    });

    // Display first question
    const questionHtml = `
      <div class="mt-6 p-4 border rounded-lg bg-gray-50">
        <p class="font-semibold text-gray-800">AI Coach:</p>
        <p class="mt-2 text-gray-700">${result.first_question}</p>
      </div>
      <div class="mt-4">
        <textarea id="userResponse" class="w-full p-2 border rounded-md" placeholder="Your answer..."></textarea>
        <button id="sendResponseBtn" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Send</button>
      </div>
    `;
    conversationDiv.innerHTML = questionHtml;

    pitchResultDiv.classList.remove('hidden');
    pitchResultDiv.scrollIntoView({ behavior: 'smooth' });
  }

  function displayError(message) {
    conversationDiv.innerHTML = `<div class="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md"><strong>Error:</strong> ${message}</div>`;
    pitchResultDiv.classList.remove('hidden');
    pitchResultDiv.scrollIntoView({ behavior: 'smooth' });
  }

  function showLoading(isLoading) {
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