// Saved searches management module

function initSavedSearches() {
    // This will be called from the main script
}

function loadSavedSearches() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const savedSearchesList = document.getElementById('saved-searches-list');
    savedSearchesList.innerHTML = '';
    
    if (!currentUser.savedSearches || currentUser.savedSearches.length === 0) {
        savedSearchesList.innerHTML = '<p>No saved searches yet.</p>';
        return;
    }
    
    currentUser.savedSearches.forEach(search => {
        const searchItem = document.createElement('div');
        searchItem.className = 'saved-search-item';
        
        let filtersText = '';
        if (search.filters) {
            if (search.filters.licenseType && search.filters.licenseType !== 'all') {
                filtersText += `License: ${search.filters.licenseType.toUpperCase()}`;
            }
            if (search.filters.extension) {
                if (filtersText) filtersText += ' | ';
                filtersText += `Ext: ${search.filters.extension}`;
            }
        }
        
        searchItem.innerHTML = `
            <div>
                <strong>${search.query}</strong>
                <p>Type: ${search.mediaType} | ${new Date(search.date).toLocaleString()}</p>
                ${filtersText ? `<p>${filtersText}</p>` : ''}
            </div>
            <div>
                <button class="btn btn-primary load-search-btn" data-id="${search.id}">Load</button>
                <button class="btn btn-danger delete-search-btn" data-id="${search.id}">Delete</button>
            </div>
        `;
        
        savedSearchesList.appendChild(searchItem);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.load-search-btn').forEach(btn => {
        btn.addEventListener('click', loadSavedSearch);
    });
    
    document.querySelectorAll('.delete-search-btn').forEach(btn => {
        btn.addEventListener('click', deleteSavedSearch);
    });
}

function loadSavedSearch(e) {
    const searchId = e.target.getAttribute('data-id');
    const currentUser = getCurrentUser();
    
    if (!currentUser) return;
    
    const search = currentUser.savedSearches.find(s => s.id === searchId);
    if (!search) return;
    
    // Set the search parameters
    document.getElementById('search-input').value = search.query;
    document.getElementById('media-type').value = search.mediaType;
    
    // Set advanced filters if they exist
    if (search.filters) {
        document.getElementById('license-type').value = search.filters.licenseType || 'all';
        document.getElementById('extension').value = search.filters.extension || '';
        
        // Show advanced search if filters were used
        if (search.filters.licenseType || search.filters.extension) {
            document.querySelector('.advanced-search').classList.remove('hidden');
            document.getElementById('advanced-search-btn').textContent = 'Hide Advanced';
        }
    }
    
    // Perform the search
    performSearch();
    showNotification('Search loaded', 'success');
}

function deleteSavedSearch(e) {
    const searchId = e.target.getAttribute('data-id');
    const currentUser = getCurrentUser();
    
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to delete this saved search?')) {
        return;
    }
    
    // Update users in localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].savedSearches = users[userIndex].savedSearches.filter(s => s.id !== searchId);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user in memory
        currentUser.savedSearches = currentUser.savedSearches.filter(s => s.id !== searchId);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Search deleted', 'success');
        loadSavedSearches();
    }
}