document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const founderProfileForm = document.getElementById('founderProfileForm');
    const educationModal = document.getElementById('education-modal');
    const workModal = document.getElementById('work-modal');
    const educationForm = document.getElementById('education-form');
    const workForm = document.getElementById('work-form');

    // --- STATE ---
    const foundersKey = 'ycAppFounders';
    let founders = [];
    let currentFounder = null;

    // --- INITIALIZATION ---
        function initialize() {
        const urlParams = new URLSearchParams(window.location.search);
        const founderId = parseInt(urlParams.get('id'), 10);
        const isNew = urlParams.get('new') === 'true';

        const storedFounders = localStorage.getItem(foundersKey);
        founders = storedFounders ? JSON.parse(storedFounders) : [];

        if (isNew) {
            // If it's a new founder, get data from session storage to avoid race condition
            const newFounderData = sessionStorage.getItem('newFounderProfile');
            if (newFounderData) {
                currentFounder = JSON.parse(newFounderData);
                sessionStorage.removeItem('newFounderProfile'); // Clean up
            } else {
                 // Fallback to local storage just in case
                currentFounder = founders.find(f => f.id === founderId);
            }
        } else {
            currentFounder = founders.find(f => f.id === founderId);
        }

        if (!currentFounder) {
            console.error('FATAL: Could not identify current founder. Redirecting.');
            window.location.href = 'index.html';
            return;
        }

        // Ensure education/work arrays exist, especially for older data
        if (!currentFounder.education) currentFounder.education = [];
        if (!currentFounder.work) currentFounder.work = [];

        populateForm();
        setupEventListeners();
    }

    // --- DATA & UI ---
    function populateForm() {
        Object.keys(currentFounder).forEach(key => {
            const field = founderProfileForm.elements[key];
            if (field) {
                if (field.type === 'radio') {
                    const radioToSelect = document.querySelector(`input[name="${key}"][value="${currentFounder[key]}"]`);
                    if(radioToSelect) radioToSelect.checked = true;
                } else {
                    field.value = currentFounder[key];
                }
            }
        });
        renderEducationList();
        renderWorkList();
    }

    function saveAndExit(e) {
        e.preventDefault();
        const formData = new FormData(founderProfileForm);
        const mainProfileData = Object.fromEntries(formData.entries());
        
        // Merge form data into our founder object (preserves education/work arrays)
        Object.assign(currentFounder, mainProfileData);

        const founderIndex = founders.findIndex(f => f.id === currentFounder.id);
        if (founderIndex !== -1) {
            founders[founderIndex] = currentFounder;
        }
        localStorage.setItem(foundersKey, JSON.stringify(founders));
        window.location.href = 'index.html';
    }
    
    function saveSubProfile() {
        // This function just saves the current state of the founder object to the main list
        const founderIndex = founders.findIndex(f => f.id === currentFounder.id);
        if (founderIndex !== -1) {
            founders[founderIndex] = currentFounder;
        }
        localStorage.setItem(foundersKey, JSON.stringify(founders));
    }

    function renderEducationList() {
        const listEl = document.getElementById('education-list');
        listEl.innerHTML = '';
        currentFounder.education.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-3 rounded-md bg-gray-50';
            div.innerHTML = `
                <div>
                    <p class="font-semibold">${item.school}</p>
                    <p class="text-sm text-gray-500">${item.degree}</p>
                </div>
                <div class="flex items-center gap-4">
                    <p class="text-sm text-gray-500">${item['edu-dates']}</p>
                    <button type="button" data-type="education" data-index="${index}" class="edit-btn text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                    <button type="button" data-type="education" data-index="${index}" class="delete-btn text-red-400 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>`;
            listEl.appendChild(div);
        });
    }

    function renderWorkList() {
        const listEl = document.getElementById('work-history-list');
        listEl.innerHTML = '';
        currentFounder.work.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-start p-3 rounded-md bg-gray-50';
            div.innerHTML = `
                <div>
                    <p class="font-semibold">${item['company-title']}</p>
                    <p class="text-sm text-gray-600 mt-1">${item['work-description']}</p>
                </div>
                <div class="flex items-center gap-4 flex-shrink-0">
                    <p class="text-sm text-gray-500">${item['work-dates']}</p>
                    <button type="button" data-type="work" data-index="${index}" class="edit-btn text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                    <button type="button" data-type="work" data-index="${index}" class="delete-btn text-red-400 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>`;
            listEl.appendChild(div);
        });
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
        founderProfileForm.addEventListener('submit', saveAndExit);

        document.body.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-btn');
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');

            if (addBtn) {
                const section = addBtn.closest('.p-4');
                if (section.querySelector('#education-list')) openModal(educationModal, educationForm);
                else if (section.querySelector('#work-history-list')) openModal(workModal, workForm);
            } else if (editBtn) {
                const type = editBtn.dataset.type;
                const index = parseInt(editBtn.dataset.index, 10);
                if (type === 'education') openModal(educationModal, educationForm, currentFounder.education[index], index);
                else if (type === 'work') openModal(workModal, workForm, currentFounder.work[index], index);
            } else if (deleteBtn) {
                if (confirm('Are you sure you want to delete this item?')) {
                    const type = deleteBtn.dataset.type;
                    const index = parseInt(deleteBtn.dataset.index, 10);
                    if (type === 'education') {
                        currentFounder.education.splice(index, 1);
                        renderEducationList();
                    } else if (type === 'work') {
                        currentFounder.work.splice(index, 1);
                        renderWorkList();
                    }
                    saveSubProfile();
                }
            }
        });

        educationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = parseInt(educationForm.querySelector('input[type="hidden"]').value, 10);
            const newItem = {
                school: educationForm.elements['school'].value,
                degree: educationForm.elements['degree'].value,
                'edu-dates': educationForm.elements['edu-dates'].value
            };
            if (index > -1) currentFounder.education[index] = newItem;
            else currentFounder.education.push(newItem);
            renderEducationList();
            saveSubProfile();
            closeModal(educationModal);
        });
        document.getElementById('cancel-education').addEventListener('click', () => closeModal(educationModal));

        workForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = parseInt(workForm.querySelector('input[type="hidden"]').value, 10);
            const newItem = {
                'company-title': workForm.elements['company-title'].value,
                'work-description': workForm.elements['work-description'].value,
                'work-dates': workForm.elements['work-dates'].value
            };
            if (index > -1) currentFounder.work[index] = newItem;
            else currentFounder.work.push(newItem);
            renderWorkList();
            saveSubProfile();
            closeModal(workModal);
        });
        document.getElementById('cancel-work').addEventListener('click', () => closeModal(workModal));
    }

    // --- START THE APP ---
    initialize();
});
