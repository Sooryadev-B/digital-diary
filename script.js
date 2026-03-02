// Storage key for localStorage
const STORAGE_KEY = 'sakuraDiary';

// Current state
let currentPage = 1;
let entries = [];

// DOM elements
const currentDateEl = document.getElementById('currentDate');
const pageInfoEl = document.getElementById('pageInfo');
const entryTitleEl = document.getElementById('entryTitle');
const entryTextEl = document.getElementById('entryText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const addPageBtn = document.getElementById('addPageBtn');
const deletePageBtn = document.getElementById('deletePageBtn');

// Get formatted date
function getFormattedDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
}

// Load entries from localStorage
function loadEntries() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
        try {
            entries = JSON.parse(savedData);
        } catch (error) {
            console.error('Error loading entries:', error);
            entries = [];
        }
    }
    
    // Create first entry if none exist
    if (entries.length === 0) {
        entries.push({
            title: '',
            text: '',
            date: new Date().toISOString()
        });
    }
}

// Save entries to localStorage
function saveEntries() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error('Error saving entries:', error);
    }
}

// Save current entry
function saveCurrentEntry() {
    if (entries[currentPage - 1]) {
        entries[currentPage - 1].title = entryTitleEl.value;
        entries[currentPage - 1].text = entryTextEl.value;
        entries[currentPage - 1].date = new Date().toISOString();
        saveEntries();
    }
}

// Display current entry
function displayCurrentEntry() {
    const entry = entries[currentPage - 1];
    
    if (entry) {
        entryTitleEl.value = entry.title || '';
        entryTextEl.value = entry.text || '';
    }
    
    updateUI();
}

// Update UI elements
function updateUI() {
    // Update date display
    currentDateEl.textContent = getFormattedDate();
    
    // Update page info
    pageInfoEl.textContent = `Page ${currentPage} of ${entries.length}`;
    
    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === entries.length;
    deletePageBtn.disabled = entries.length === 1;
}

// Navigate to previous page
function goToPreviousPage() {
    if (currentPage > 1) {
        saveCurrentEntry();
        currentPage--;
        displayCurrentEntry();
    }
}

// Navigate to next page
function goToNextPage() {
    if (currentPage < entries.length) {
        saveCurrentEntry();
        currentPage++;
        displayCurrentEntry();
    }
}

// Add new entry
function addNewEntry() {
    saveCurrentEntry();
    
    entries.push({
        title: '',
        text: '',
        date: new Date().toISOString()
    });
    
    currentPage = entries.length;
    displayCurrentEntry();
    saveEntries();
    
    // Focus on title input
    entryTitleEl.focus();
}

// Delete current entry
function deleteCurrentEntry() {
    if (entries.length === 1) return;
    
    if (confirm('Are you sure you want to delete this entry?')) {
        entries.splice(currentPage - 1, 1);
        
        // Adjust current page if needed
        if (currentPage > entries.length) {
            currentPage = entries.length;
        }
        
        displayCurrentEntry();
        saveEntries();
    }
}

// Auto-save on input
function setupAutoSave() {
    let saveTimeout;
    
    const autoSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveCurrentEntry();
        }, 1000); // Save 1 second after user stops typing
    };
    
    entryTitleEl.addEventListener('input', autoSave);
    entryTextEl.addEventListener('input', autoSave);
}

// Event listeners
prevBtn.addEventListener('click', goToPreviousPage);
nextBtn.addEventListener('click', goToNextPage);
addPageBtn.addEventListener('click', addNewEntry);
deletePageBtn.addEventListener('click', deleteCurrentEntry);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Arrow Left: Previous page
    if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousPage();
    }
    
    // Ctrl/Cmd + Arrow Right: Next page
    if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPage();
    }
    
    // Ctrl/Cmd + N: New entry
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addNewEntry();
    }
});

// Initialize the diary
function init() {
    loadEntries();
    displayCurrentEntry();
    setupAutoSave();
}

// Start the application
init();
