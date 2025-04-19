// Main application script - coordinates between other modules

document.addEventListener('DOMContentLoaded', function() {
    // Initialize modules
    initAuth();
    initSearch();
    initSavedSearches();
    
    // Event listeners for main navigation
    document.getElementById('advanced-search-btn').addEventListener('click', toggleAdvancedSearch);
    
    // Check if user is logged in on page load
    checkAuthState();
});

function toggleAdvancedSearch() {
    const advancedSearch = document.querySelector('.advanced-search');
    advancedSearch.classList.toggle('hidden');
    
    const btn = document.getElementById('advanced-search-btn');
    if (advancedSearch.classList.contains('hidden')) {
        btn.textContent = 'Advanced';
    } else {
        btn.textContent = 'Hide Advanced';
    }
}

// Global function to show notification
function showNotification(message, type = 'info') {
    // Remove old toast if present
    let oldToast = document.getElementById('toast-notification');
    if (oldToast) oldToast.remove();
    // Create toast
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = `toast-notification toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3200);
    // Also log to console
    console.log(`${type.toUpperCase()}: ${message}`);
}