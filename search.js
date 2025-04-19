// Search functionality module

function initSearch() {
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    document.getElementById('save-search-btn').addEventListener('click', saveCurrentSearch);
}

async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    const mediaType = document.getElementById('media-type').value;

    if (!query) {
        showNotification('Please enter a search term', 'error');
        return;
    }

    // Show loading spinner
    document.getElementById('loading-spinner').classList.remove('hidden');
    document.getElementById('no-results').classList.add('hidden');

    let apiResults = [];
    let dummyResults = [];

    try {
        // Build API URL based on search criteria
        let apiUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}`;
        
        if (mediaType === 'audio') {
            apiUrl = `https://api.openverse.org/v1/audio/?q=${encodeURIComponent(query)}`;
        }
        
        // Add advanced filters if they're visible and have values
        let licenseType = 'all';
        let extension = '';
        if (!document.querySelector('.advanced-search').classList.contains('hidden')) {
            licenseType = document.getElementById('license-type').value;
            extension = document.getElementById('extension').value.trim();
            if (licenseType !== 'all') {
                apiUrl += `&license_type=${licenseType}`;
            }
            if (extension) {
                apiUrl += `&extension=${extension}`;
            }
        }
        
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            apiResults = data.results || [];
        }
    } catch (error) {
        console.warn('Search API error, falling back to local projects.');
        // No notification to user
    }

    try {
        const projectsResponse = await fetch('projects.json');
        if (projectsResponse.ok) {
            const projects = await projectsResponse.json();
            // Filter dummy projects by title (case-insensitive)
            dummyResults = projects.filter(p => {
                let match = p.title.toLowerCase().includes(query.toLowerCase());
                // Apply mediaType filter: if searching for audio, only include audio projects (if you have such a field, else skip)
                // Apply licenseType filter
                if (!document.querySelector('.advanced-search').classList.contains('hidden')) {
                    if (licenseType !== 'all' && p.license.toLowerCase() !== licenseType.toLowerCase()) {
                        match = false;
                    }
                    if (extension) {
                        // Only match if URL or image ends with the extension
                        const ext = extension.startsWith('.') ? extension.toLowerCase() : '.' + extension.toLowerCase();
                        if (p.url && !p.url.toLowerCase().endsWith(ext) && p.image && !p.image.toLowerCase().endsWith(ext)) {
                            match = false;
                        }
                    }
                }
                return match;
            });
        }
    } catch (err) {
        console.error('Failed to load dummy projects:', err);
    }

    // Merge results (API first, then dummy)
    const allResults = [...apiResults, ...dummyResults];
    displayResults(allResults);

    document.getElementById('loading-spinner').classList.add('hidden');
    if (allResults.length === 0) {
        document.getElementById('no-results').classList.remove('hidden');
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    if (!results || results.length === 0) {
        document.getElementById('no-results').classList.remove('hidden');
        return;
    }

    // 4 items per row (CSS grid already handles this, but ensure .results-grid has 4 columns)
    // If you want to enforce 4 columns, update the CSS if needed.

    results.forEach(item => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';

        let mediaContent = '';
        // If item has an image field, use it. Otherwise, use url if it's an image.
        if (item.image) {
            mediaContent = `<img src="${item.image}" alt="${item.title}" style="width:100%;height:180px;object-fit:cover;">`;
        } else if (item.url && (item.url.endsWith('.jpg') || item.url.endsWith('.png') || item.url.endsWith('.jpeg'))) {
            mediaContent = `<img src="${item.url}" alt="${item.title || 'Image'}" style="width:100%;height:180px;object-fit:cover;">`;
        } else if (item.url && (item.url.endsWith('.mp3') || item.url.endsWith('.wav') || item.url.endsWith('.ogg'))) {
            mediaContent = `<audio controls style="width: 100%"><source src="${item.url}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
        } else {
            mediaContent = `<div style="height: 200px; display: flex; align-items: center; justify-content: center; background: #f0f0f0;">
                <span>Preview not available</span>
            </div>`;
        }
        
        mediaItem.innerHTML = `
            ${mediaContent}
            <div class="media-info">
                <h3>${item.title || 'Untitled'}</h3>
                <p>Creator: ${item.creator || 'Unknown'}</p>
                <p>License: ${item.license || 'Not specified'}</p>
                <a href="${item.url}" target="_blank" class="btn btn-primary" style="display: inline-block; margin-top: 10px;">View Original</a>
            </div>
        `;
        
        resultsContainer.appendChild(mediaItem);
    });
}

function saveCurrentSearch() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('You need to be logged in to save searches', 'error');
        return;
    }
    
    const query = document.getElementById('search-input').value.trim();
    const mediaType = document.getElementById('media-type').value;
    
    if (!query) {
        showNotification('No search to save', 'error');
        return;
    }
    
    // Get advanced filters if they're visible
    let filters = {};
    if (!document.querySelector('.advanced-search').classList.contains('hidden')) {
        filters.licenseType = document.getElementById('license-type').value;
        filters.extension = document.getElementById('extension').value.trim();
    }
    
    const searchData = {
        id: Date.now().toString(),
        query,
        mediaType,
        filters,
        date: new Date().toISOString()
    };
    
    // Update user's saved searches
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].savedSearches.push(searchData);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user in memory
        currentUser.savedSearches.push(searchData);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Search saved successfully', 'success');
        loadSavedSearches();
    }
}

// Helper function to get current search parameters
function getCurrentSearchParams() {
    return {
        query: document.getElementById('search-input').value.trim(),
        mediaType: document.getElementById('media-type').value,
        licenseType: document.getElementById('license-type').value,
        extension: document.getElementById('extension').value.trim()
    };
}