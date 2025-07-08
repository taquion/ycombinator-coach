document.addEventListener('DOMContentLoaded', () => {
    const profileKey = 'founderProfile';
    let profileData = {};

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
            div.className = 'flex justify-between items-center';
            div.innerHTML = `
                <div>
                    <p class="font-semibold">${item.school}</p>
                    <p class="text-sm text-gray-500">${item.degree}</p>
                </div>
                <div class="flex items-center gap-4">
                    <p class="text-sm text-gray-500">${item.dates}</p>
                    <button type="button" data-type="education" data-index="${index}" class="edit-btn text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
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
            div.className = 'flex justify-between items-start';
            div.innerHTML = `
                <div>
                    <p class="font-semibold">${item.companyTitle}</p>
                    <p class="text-sm text-gray-600 mt-1">${item.description}</p>
                </div>
                <div class="flex items-center gap-4 flex-shrink-0">
                    <p class="text-sm text-gray-500">${item.dates}</p>
                    <button type="button" data-type="work" data-index="${index}" class="edit-btn text-gray-400 hover:text-gray-600">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
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
            // Pre-populate with default data if nothing is saved
            profileData = {
                education: [
                    { school: 'Harvard Extension School', degree: 'MA, Data Science', dates: 'Jul 2022 - Jul 2025' },
                    { school: 'Universidad de Monterrey', degree: 'BA, Economics', dates: 'Dec 2007 - Dec 2011' }
                ],
                work: [
                    { companyTitle: 'Crediclub - Product Director', description: 'Product director at a Fintech company in Mexico', dates: 'Nov 2023 - Present' },
                    { companyTitle: 'EnviaFlores.com - Director Comercial & Marketing', description: '', dates: 'Feb 2021 - Nov 2023' },
                    { companyTitle: 'EnviaFlores.com - Director de operaciones', description: '', dates: 'Jan 2019 - Jan 2021' },
                    { companyTitle: 'Rappi - City Manager', description: '', dates: 'Mar 2018 - Dec 2018' },
                    { companyTitle: 'Uber - Sr. Operations and Logistics Manager', description: '', dates: 'Dec 2016 - Mar 2018' },
                ]
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
    document.querySelector('[aria-labelledby="background"]').addEventListener('click', (e) => {
        if (e.target.textContent === '+ Add') {
            const section = e.target.closest('.p-4');
            if (section.querySelector('#education-list')) {
                openModal(educationModal, educationForm);
            } else if (section.querySelector('#work-history-list')) {
                openModal(workModal, workForm);
            }
        }
        if (e.target.classList.contains('edit-btn')) {
            const type = e.target.dataset.type;
            const index = parseInt(e.target.dataset.index, 10);
            if (type === 'education') {
                openModal(educationModal, educationForm, profileData.education[index], index);
            } else if (type === 'work') {
                openModal(workModal, workForm, profileData.work[index], index);
            }
        }
    });

    // Education modal events
    document.getElementById('save-education').addEventListener('click', () => {
        const index = parseInt(educationForm.querySelector('input[type="hidden"]').value, 10);
        const newItem = {
            school: educationForm.elements['school'].value,
            degree: educationForm.elements['degree'].value,
            dates: educationForm.elements['edu-dates'].value
        };
        if (index > -1) {
            profileData.education[index] = newItem;
        } else {
            profileData.education.push(newItem);
        }
        renderEducationList();
        saveProfile();
        closeModal(educationModal);
    });
    document.getElementById('cancel-education').addEventListener('click', () => closeModal(educationModal));

    // Work modal events
    document.getElementById('save-work').addEventListener('click', () => {
        const index = parseInt(workForm.querySelector('input[type="hidden"]').value, 10);
        const newItem = {
            companyTitle: workForm.elements['company-title'].value,
            description: workForm.elements['work-description'].value,
            dates: workForm.elements['work-dates'].value
        };
        if (index > -1) {
            profileData.work[index] = newItem;
        } else {
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

    // --- INITIAL LOAD ---
    loadProfile();
});
