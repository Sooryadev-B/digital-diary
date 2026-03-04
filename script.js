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
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const exportBtn = document.getElementById('exportBtn');
const exportMenu = document.getElementById('exportMenu');
const exportTxtBtn = document.getElementById('exportTxtBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const togglePreviewBtn = document.getElementById('togglePreviewBtn');
const previewEl = document.getElementById('preview');

// Search state
let filteredEntries = [];
let isSearching = false;

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
    const totalPages = isSearching ? filteredEntries.length : entries.length;
    pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
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
    const totalPages = isSearching ? filteredEntries.length : entries.length;
    if (currentPage < totalPages) {
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
searchInput.addEventListener('input', (e) => performSearch(e.target.value));
clearSearchBtn.addEventListener('click', clearSearch);
exportBtn.addEventListener('click', toggleExportMenu);
exportTxtBtn.addEventListener('click', exportAsTxt);
exportJsonBtn.addEventListener('click', exportAsJson);
togglePreviewBtn.addEventListener('click', togglePreview);

// Toolbar buttons
document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        insertMarkdown(btn.dataset.format);
    });
});

// Close export menu when clicking outside
document.addEventListener('click', (e) => {
    if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
        exportMenu.style.display = 'none';
    }
});

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

// Search functionality
function performSearch(query) {
    if (!query.trim()) {
        isSearching = false;
        filteredEntries = [];
        clearSearchBtn.style.display = 'none';
        currentPage = 1;
        displayCurrentEntry();
        return;
    }
    
    isSearching = true;
    clearSearchBtn.style.display = 'block';
    
    const lowerQuery = query.toLowerCase();
    filteredEntries = entries.filter((entry, index) => {
        const titleMatch = entry.title.toLowerCase().includes(lowerQuery);
        const dateMatch = new Date(entry.date).toLocaleDateString().includes(lowerQuery);
        
        if (titleMatch || dateMatch) {
            entry.originalIndex = index;
            return true;
        }
        return false;
    });
    
    currentPage = 1;
    displayCurrentEntry();
}

function clearSearch() {
    searchInput.value = '';
    isSearching = false;
    filteredEntries = [];
    clearSearchBtn.style.display = 'none';
    currentPage = 1;
    displayCurrentEntry();
}

// Display current entry (updated for search)
function displayCurrentEntryOriginal() {
    const entry = entries[currentPage - 1];
    
    if (entry) {
        entryTitleEl.value = entry.title || '';
        entryTextEl.value = entry.text || '';
    }
    
    updateUI();
}

// Override display function to handle search
function displayCurrentEntry() {
    let entry;
    
    if (isSearching && filteredEntries.length > 0) {
        entry = filteredEntries[currentPage - 1];
    } else if (isSearching && filteredEntries.length === 0) {
        entryTitleEl.value = '';
        entryTextEl.value = 'No entries found matching your search.';
        entryTitleEl.disabled = true;
        entryTextEl.disabled = true;
        updateUI();
        return;
    } else {
        entry = entries[currentPage - 1];
    }
    
    if (entry) {
        entryTitleEl.value = entry.title || '';
        entryTextEl.value = entry.text || '';
        entryTitleEl.disabled = false;
        entryTextEl.disabled = false;
    }
    
    updateUI();
}

// Markdown rendering
function renderMarkdown(text) {
    let html = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\n/g, '<br>');
    
    if (html.includes('<li>')) {
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }
    
    return html;
}

function togglePreview() {
    const isPreviewVisible = previewEl.style.display !== 'none';
    
    if (isPreviewVisible) {
        previewEl.style.display = 'none';
        entryTextEl.style.display = 'block';
        togglePreviewBtn.textContent = '👁 Preview';
    } else {
        previewEl.innerHTML = renderMarkdown(entryTextEl.value);
        previewEl.style.display = 'block';
        entryTextEl.style.display = 'none';
        togglePreviewBtn.textContent = '✏ Edit';
    }
}

// Toolbar formatting
function insertMarkdown(format) {
    const start = entryTextEl.selectionStart;
    const end = entryTextEl.selectionEnd;
    const selectedText = entryTextEl.value.substring(start, end);
    let replacement = '';
    
    switch(format) {
        case 'bold':
            replacement = `**${selectedText || 'bold text'}**`;
            break;
        case 'italic':
            replacement = `*${selectedText || 'italic text'}*`;
            break;
        case 'heading':
            replacement = `# ${selectedText || 'heading'}`;
            break;
        case 'list':
            replacement = `- ${selectedText || 'list item'}`;
            break;
    }
    
    entryTextEl.value = entryTextEl.value.substring(0, start) + replacement + entryTextEl.value.substring(end);
    entryTextEl.focus();
    entryTextEl.setSelectionRange(start + replacement.length, start + replacement.length);
    saveCurrentEntry();
}

// Export functionality
function exportAsTxt() {
    let content = '🌸 Sakura Diary Export 🌸\n';
    content += '='.repeat(50) + '\n\n';
    
    entries.forEach((entry, index) => {
        content += `Entry ${index + 1}\n`;
        content += `Date: ${new Date(entry.date).toLocaleDateString()}\n`;
        content += `Title: ${entry.title || 'Untitled'}\n`;
        content += '-'.repeat(50) + '\n';
        content += entry.text + '\n\n';
        content += '='.repeat(50) + '\n\n';
    });
    
    downloadFile(content, 'sakura-diary.txt', 'text/plain');
}

function exportAsJson() {
    const jsonContent = JSON.stringify(entries, null, 2);
    downloadFile(jsonContent, 'sakura-diary.json', 'application/json');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    exportMenu.style.display = 'none';
}

function toggleExportMenu() {
    exportMenu.style.display = exportMenu.style.display === 'none' ? 'flex' : 'none';
}

// Initialize the diary
function init() {
    loadEntries();
    displayCurrentEntry();
    setupAutoSave();
}

// Start the application
init();
