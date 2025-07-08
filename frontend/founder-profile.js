document.addEventListener('DOMContentLoaded', () => {
    const founderProfileForm = document.getElementById('founderProfileForm');
    const profileKey = 'founderProfile';

    // Load existing profile data from local storage
    function loadProfile() {
        const savedProfile = localStorage.getItem(profileKey);
        if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            Object.keys(profileData).forEach(key => {
                const input = founderProfileForm.elements[key];
                if (input) {
                    if (input.type === 'radio') {
                        // Handle radio buttons
                        document.querySelector(`input[name="${key}"][value="${profileData[key]}"]`).checked = true;
                    } else {
                        input.value = profileData[key];
                    }
                }
            });
        }
    }

    // Save profile data to local storage
    function saveProfile() {
        const formData = new FormData(founderProfileForm);
        const profileData = Object.fromEntries(formData.entries());
        localStorage.setItem(profileKey, JSON.stringify(profileData));
        alert('Profile saved!');
    }

    founderProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile();
    });

    // Initial load
    loadProfile();
});
