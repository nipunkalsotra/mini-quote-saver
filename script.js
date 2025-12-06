// Get elements
const quoteInput = document.getElementById('quoteInput');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const quotesList = document.getElementById('quotesList');
const quoteCount = document.getElementById('quoteCount');
const wordCount = document.getElementById('wordCount');
const clearAllBtn = document.getElementById('clearAllBtn');
const statusMessage = document.getElementById('statusMessage');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let editingIndex = null;

// Load quotes from localStorage
function loadQuotes() {
    const quotes = localStorage.getItem('quotes');
    return quotes ? JSON.parse(quotes) : [];
}

// Save quotes to localStorage
function saveQuotes(quotes) {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show status message
function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message show ${type}`;
    setTimeout(() => statusMessage.classList.remove('show'), 3000);
}

// Calculate word count
function calculateWordCount(quotes) {
    return quotes.reduce((total, q) => total + q.text.split(/\s+/).filter(w => w).length, 0);
}

// Update stats
function updateStats(quotes) {
    const count = quotes.length;
    const words = calculateWordCount(quotes);
    quoteCount.textContent = `${count} quote${count!==1?'s':''}`;
    wordCount.textContent = `${words} word${words!==1?'s':''}`;
    clearAllBtn.disabled = count===0;
}

// Category badge
function getCategoryBadge(category) {
    return `<span class="category-badge category-${category}">${category}</span>`;
}

// Filter quotes
function filterQuotes(quotes) {
    if(currentFilter==='all') return quotes;
    if(currentFilter==='favorites') return quotes.filter(q=>q.favorite);
    return quotes.filter(q=>q.category===currentFilter);
}

// Render quotes
function renderQuotes() {
    const allQuotes = loadQuotes();
    const quotes = filterQuotes(allQuotes);

    if(quotes.length===0){
        const emptyMessage = currentFilter==='all'? 'No quotes yet. Add your first quote above!' : `No ${currentFilter} quotes found.`;
        quotesList.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">${emptyMessage}</div></div>`;
        updateStats(allQuotes);
        return;
    }

    quotesList.innerHTML = quotes.map(q=>{
        const actualIndex = allQuotes.indexOf(q);
        const favoriteIcon = q.favorite ? '⭐' : '☆';
        const isEditing = editingIndex===actualIndex;
        return `<li class="quote-item ${q.favorite?'favorite':''}">
            <div class="quote-content">
                <div class="quote-left">
                    ${getCategoryBadge(q.category)}
                    ${isEditing?`<input type="text" class="quote-edit-input" id="editInput${actualIndex}" value="${q.text}" maxlength="200">`:
                    `<div class="quote-text">${q.text}</div>`}
                </div>
                <div class="quote-actions">
                    ${isEditing?`<button class="action-btn save-btn" onclick="saveEdit(${actualIndex})">💾 Save</button>
                    <button class="action-btn cancel-btn" onclick="cancelEdit()">✖️ Cancel</button>`:
                    `<button class="action-btn favorite-btn" onclick="toggleFavorite(${actualIndex})">${favoriteIcon}</button>
                    <button class="action-btn edit-btn" onclick="startEdit(${actualIndex})">✏️ Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteQuote(${actualIndex})">🗑️</button>`}
                </div>
            </div>
        </li>`;
    }).join('');

    updateStats(allQuotes);
}

// Add quote
function addQuote(){
    const text = quoteInput.value.trim();
    const category = categorySelect.value;
    if(!text){ showStatus('⚠️ Please enter a quote!', 'error'); quoteInput.focus(); return; }
    const quotes = loadQuotes();
    quotes.push({text, category, favorite:false, timestamp:Date.now()});
    saveQuotes(quotes);
    quoteInput.value='';
    renderQuotes();
    showStatus('✅ Quote added successfully!');
    quoteInput.focus();
}

// Toggle favorite
function toggleFavorite(index){
    const quotes = loadQuotes();
    quotes[index].favorite = !quotes[index].favorite;
    saveQuotes(quotes);
    renderQuotes();
    showStatus(quotes[index].favorite?'⭐ Added to favorites!':'☆ Removed from favorites!');
}

// Edit quote
function startEdit(index){ editingIndex=index; renderQuotes(); const input=document.getElementById(`editInput${index}`); if(input){input.focus();input.select();} }
function saveEdit(index){ const input=document.getElementById(`editInput${index}`); const newText=input.value.trim(); if(!newText){showStatus('⚠️ Quote cannot be empty!','error');return;} const quotes=loadQuotes(); quotes[index].text=newText; saveQuotes(quotes); editingIndex=null; renderQuotes(); showStatus('✅ Quote updated!'); }
function cancelEdit(){ editingIndex=null; renderQuotes(); }

// Delete quote
function deleteQuote(index){ const quotes=loadQuotes(); quotes.splice(index,1); saveQuotes(quotes); renderQuotes(); showStatus('🗑️ Quote deleted!'); }

// Clear all
function clearAllQuotes(){ if(!confirm('Are you sure you want to delete all quotes?')) return; localStorage.removeItem('quotes'); renderQuotes(); showStatus('🗑️ All quotes cleared!'); }

// Event listeners
addBtn.addEventListener('click',addQuote);
quoteInput.addEventListener('keypress',(e)=>{if(e.key==='Enter') addQuote();});
clearAllBtn.addEventListener('click',clearAllQuotes);
filterBtns.forEach(btn=>{btn.addEventListener('click',()=>{filterBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); currentFilter=btn.getAttribute('data-filter'); editingIndex=null; renderQuotes();});});

// Global access
window.deleteQuote=deleteQuote;
window.toggleFavorite=toggleFavorite;
window.startEdit=startEdit;
window.saveEdit=saveEdit;
window.cancelEdit=cancelEdit;

// Initialize
renderQuotes();
quoteInput.focus();
