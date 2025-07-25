document.addEventListener('DOMContentLoaded', () => {
    const profileKey = 'founderProfile-v3'; // New key to ensure fresh start
    localStorage.removeItem(profileKey); // Always start with a clean slate
    let profileData = {};

    // --- FORM RESET --- 
    function clearForm() {
        // Clear main form fields
        const mainForm = document.getElementById('founderProfileForm');
        mainForm.reset();

        // Clear dynamic l
        profileData = {
            education: [],
            work: []
        };
        
        // Clear local storage and re-render empty lists
        localStorage.removeItem(profileKey);
        renderEducationList();
        renderWorkList();
        console.log('Profile cleared and form reset.');
    }

    // --- MODAL AND FORM ELEMENTS ---
    const educationModal = document.getElementById('education-modal');
    const workModal = document.getElementById('work-modal');
    const educationForm = document.getElementById('education-form');
    const workForm = document.getElementById('work-form');

    // --- DATA RENDERING FUNCTIONS ---
    function renderEducationList() {
        const listEl = document.getElementById('education-list');
        listEl.innerHTML = ''; // Clear existing
        profileData.education?.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-3 rounded-md bg-gray-50';
            div.innerHTML = `
                <div>
                    <p class="font-semibold">${item.school}</p>
                    <p class="text-sm text-gray-500">${item.degree}</p>
                </div>
                <div class="flex items-center gap-4">
                    <p class="text-sm text-gray-500">${item['edu-dates']}</p>
                    <button type="button" data-type="education" data-index="${index}" class="edit-btn text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                    </button>
                    <button type="button" data-type="education" data-index="${index}" class="delete-btn text-red-400 hover:text-red-600"> 
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>`;
            listEl.appendChild(div);
        });
    }

    function renderWorkList() {
        const listEl = document.getElementById('work-history-list');
        listEl.innerHTML = ''; // Clear existing
        profileData.work?.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-start p-3 rounded-md bg-gray-50';
            div.innerHTML = `
                <div>
                    <p class="font-semibold">${item['company-title']}</p>
                    <p class="text-sm text-gray-600 mt-1">${item['work-description']}</p>
                </div>
                <div class="flex items-center gap-4 flex-shrink-0">
                    <p class="text-sm text-gray-500">${item['work-dates']}</p>
                    <button type="button" data-type="work" data-index="${index}" class="edit-btn text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                    </button>
                    <button type="button" data-type="work" data-index="${index}" class="delete-btn text-red-400 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>`;
            listEl.appendChild(div);
        });
    }

    // --- DATA MANAGEMENT ---
    function loadProfile() {
        const savedProfile = localStorage.getItem(profileKey);
        if (savedProfile) {
            profileData = JSON.parse(savedProfile);
        } else {
            // Start with empty data if nothing is saved
            profileData = {
                education: [],
                work: []
            };
        }

        // Populate main form fields
        const mainForm = document.getElementById('founderProfileForm');
        Object.keys(profileData).forEach(key => {
            if (mainForm.elements[key]) {
                if (mainForm.elements[key].type === 'radio') {
                    document.querySelector(`input[name="${key}"][value="${profileData[key]}"]`).checked = true;
                } else {
                    mainForm.elements[key].value = profileData[key];
                }
            }
        });

        renderEducationList();
        renderWorkList();
    }

    function saveProfile() {
        const mainForm = document.getElementById('founderProfileForm');
        const formData = new FormData(mainForm);
        const mainProfileData = Object.fromEntries(formData.entries());
        
        // Merge main form data with dynamic list data
        profileData = { ...profileData, ...mainProfileData };

        localStorage.setItem(profileKey, JSON.stringify(profileData));
        console.log('Profile Saved:', profileData);
    }

    // --- MODAL LOGIC ---
    function openModal(modal, form, data = {}, index = -1) {
        form.reset();
        form.querySelector('input[type="hidden"]').value = index;
        if (data) {
            Object.keys(data).forEach(key => {
                if (form.elements[key]) form.elements[key].value = data[key];
            });
        }
        modal.classList.remove('hidden');
    }

    function closeModal(modal) {
        modal.classList.add('hidden');
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        document.body.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-btn');
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');

            if (addBtn) {
                const section = addBtn.closest('.p-4');
                if (section.querySelector('#education-list')) {
                    openModal(educationModal, educationForm);
                } else if (section.querySelector('#work-history-list')) {
                    openModal(workModal, workForm);
                }
            } else if (editBtn) {
                const type = editBtn.dataset.type;
                const index = parseInt(editBtn.dataset.index, 10);
                if (type === 'education') {
                    openModal(educationModal, educationForm, profileData.education[index], index);
                } else if (type === 'work') {
                    openModal(workModal, workForm, profileData.work[index], index);
                }
            } else if (deleteBtn) {
                const type = deleteBtn.dataset.type;
                const index = parseInt(deleteBtn.dataset.index, 10);
                
                if (confirm('Are you sure you want to delete this item?')) {
                    if (type === 'education') {
                        profileData.education.splice(index, 1);
                        renderEducationList();
                    } else if (type === 'work') {
                        profileData.work.splice(index, 1);
                        renderWorkList();
                    }
                    saveProfile();
                }
            }
        });
    }

    // Education modal events
    educationForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        const index = parseInt(educationForm.querySelector('input[type="hidden"]').value, 10);
        const newItem = {
            school: educationForm.elements['school'].value,
            degree: educationForm.elements['degree'].value,
            'edu-dates': educationForm.elements['edu-dates'].value
        };
        if (index > -1) {
            profileData.education[index] = newItem;
        } else {
            if (!profileData.education) profileData.education = [];
            profileData.education.push(newItem);
        }
        renderEducationList();
        saveProfile();
        closeModal(educationModal);
    });
    document.getElementById('cancel-education').addEventListener('click', () => closeModal(educationModal));

    // Work modal events
    workForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        const index = parseInt(workForm.querySelector('input[type="hidden"]').value, 10);
        const newItem = {
            'company-title': workForm.elements['company-title'].value,
            'work-description': workForm.elements['work-description'].value,
            'work-dates': workForm.elements['work-dates'].value
        };
        if (index > -1) {
            profileData.work[index] = newItem;
        } else {
            if (!profileData.work) profileData.work = [];
            profileData.work.push(newItem);
        }
        renderWorkList();
        saveProfile();
        closeModal(workModal);
    });
    document.getElementById('cancel-work').addEventListener('click', () => closeModal(workModal));

    // Save main profile on submit
    document.getElementById('founderProfileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile();
        alert('Profile saved!');
    });

    // --- INITIAL LOAD & SETUP ---
    clearForm(); // Start with a clean slate
    loadProfile(); // Load any existing data (which should be none on first load)
    setupEventListeners();
});
