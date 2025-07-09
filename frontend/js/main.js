document.addEventListener('DOMContentLoaded', () => {
    const addCofounderBtn = document.getElementById('add-cofounder-btn');
    const founderList = document.getElementById('founder-list');

    // Use localStorage to persist founder data
    const getFounders = () => JSON.parse(localStorage.getItem('founders')) || [];
    const saveFounders = (founders) => localStorage.setItem('founders', JSON.stringify(founders));

    const renderFounders = () => {
        const founders = getFounders();
        founderList.innerHTML = ''; // Clear existing list
        founders.forEach((founder) => {
            const founderEl = document.createElement('div');
            founderEl.className = 'founder-item flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md';
            founderEl.innerHTML = `
                <div>
                    <p class="font-semibold">${founder.name || `Founder ${founder.id}`}</p>
                </div>
                <a href="founder-profile.html?id=${founder.id}" class="text-sm font-semibold text-orange-600 hover:underline">Edit Profile</a>
            `;
            founderList.appendChild(founderEl);
        });
    };

    const addCofounder = () => {
        const founders = getFounders();
        const newFounder = {
            id: founders.length + 1,
            name: `Founder ${founders.length + 1}` // Default name
        };
        const updatedFounders = [...founders, newFounder];
        saveFounders(updatedFounders);
        renderFounders();
    };

    // Initial setup
    if (addCofounderBtn) {
        addCofounderBtn.addEventListener('click', addCofounder);
    }
    
    // Ensure the list is empty on first load for a clean slate, then render.
    if (!localStorage.getItem('foundersInitialized')) {
        localStorage.setItem('founders', JSON.stringify([]));
        localStorage.setItem('foundersInitialized', 'true');
    }

    renderFounders();
});
