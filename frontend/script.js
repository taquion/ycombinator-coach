// DOM Elements
const form = document.getElementById('yc-form');
const resultDiv = document.getElementById('result');
const pitchOutput = document.getElementById('pitch-output');

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    resultDiv.classList.remove('hidden');
    pitchOutput.innerHTML = 'Generating your YC pitch... <span class="animate-pulse">✨</span>';
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        problem: document.getElementById('problem').value,
        solution: document.getElementById('solution').value,
        team: document.getElementById('team').value,
        traction: document.getElementById('traction').value
    };

    try {
        // In development, use a placeholder response
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        let response;
        if (isDevelopment) {
            // Simulate API call with timeout
            response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            feedback: generateMockPitch(formData)
                        })
                    });
                }, 1500);
            });
        } else {
            // Local FastAPI server
            response = await fetch("http://localhost:8000/api/generate_pitch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
        }

        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // Display the generated pitch with formatting
        pitchOutput.innerHTML = formatPitchOutput(data.feedback);
        
    } catch (error) {
        console.error('Error:', error);
        pitchOutput.innerHTML = `❌ Error generating pitch: ${error.message}. Please try again.`;
    } finally {
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
});

// Format the pitch output with proper line breaks and sections
function formatPitchOutput(text) {
    // Split into sections based on common YC pitch structure
    const sections = {
        'Pitch': '',
        'YC Readiness Score': '',
        'Suggestions': ''
    };
    
    // Simple formatting - in a real app, you might want to parse this more robustly
    return text
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.trim() === '') return '';
            // Check for section headers
            if (paragraph.includes('YC Readiness Score:')) {
                return `<h4 class="font-semibold mt-4 mb-2 text-orange-600">${paragraph}</h4>`;
            }
            if (paragraph.includes('Suggestions:')) {
                return `<h4 class="font-semibold mt-4 mb-2 text-orange-600">${paragraph}</h4>`;
            }
            // Format list items
            if (paragraph.startsWith('- ')) {
                return `<li class="ml-4">${paragraph.substring(2)}</li>`;
            }
            return `<p class="mb-3">${paragraph}</p>`;
        })
        .join('');
}

// Generate a mock pitch for development
function generateMockPitch(data) {
    return `Pitch for ${data.name}:

${data.name} is ${data.description}. We're solving ${data.problem} by ${data.solution}.

Our team brings ${data.team} and we've already achieved ${data.traction}.

YC Readiness Score: 7/10

Suggestions:
- Consider adding more specific metrics to your traction
- Expand on your team's relevant experience
- Refine your problem statement to be more specific`;
}