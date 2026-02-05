// Main Application Logic
let map;
let markers = [];
let allLocations = [];
let currentView = 'map';
let sortColumn = null;
let sortDirection = 'asc';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Harold\'s Chicken Dashboard...');
    
    // Initialize map
    initMap();
    
    // Load data
    await loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Populate filter dropdowns
    populateFilters();
    
    // No longer call updateTimestamp() here - it's handled in loadData()
});

// Initialize Leaflet map
function initMap() {
    // Center on Chicago
    map = L.map('map').setView([41.8781, -87.6298], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

// Load location data with reviews and analyze
async function loadData() {
    try {
        // Fetch data from data.json (updated daily by GitHub Action)
        const response = await fetch('data.json');
        const data = await response.json();
        
        const tfidf = new TFIDFAnalyzer();
        
        // Process each location to extract significant phrases
        allLocations = data.locations.map(location => {
            const keyPhrases = tfidf.extractSignificantPhrasesWithNGrams(location.reviews, 5);
            return {
                ...location,
                keyPhrases
            };
        });
        
        console.log(`Loaded ${allLocations.length} locations`);
        
        // Display data
        displayMarkers(allLocations);
        updateTable(allLocations);
        
        // Update timestamp with data.json lastUpdated field
        if (data.lastUpdated) {
            const date = new Date(data.lastUpdated);
            const formatted = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            document.getElementById('lastUpdated').textContent = formatted;
        } else {
            updateTimestamp();
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading location data. Please refresh the page.');
    }
}

// Display markers on the map
function displayMarkers(locations) {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];
    
    locations.forEach(location => {
        const markerColor = getMarkerColor(location.rating);
        
        const marker = L.circleMarker([location.lat, location.lng], {
            radius: 10,
            fillColor: markerColor,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);
        
        // Create popup content
        const popupContent = `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #667eea;">${location.name}</h3>
                <p style="margin: 5px 0;"><strong>Neighborhood:</strong> ${location.neighborhood}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${location.address}</p>
                <p style="margin: 5px 0;"><strong>Rating:</strong> ⭐ ${location.rating} (${location.reviewCount} reviews)</p>
                <button onclick="showDetails(${JSON.stringify(location.name)})" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">View Details</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        markers.push(marker);
    });
}

// Get marker color based on rating using dynamic gradient
function getMarkerColor(rating) {
    // For Harold's, ratings typically range from 3.0 to 4.5
    // Use a gradient from red (poor) to yellow (okay) to green (great)
    const minRating = 3.0;
    const maxRating = 4.5;
    
    // Normalize rating to 0-1 scale
    const normalized = Math.max(0, Math.min(1, (rating - minRating) / (maxRating - minRating)));
    
    // Create gradient: red -> orange -> yellow -> light green -> green
    let r, g, b;
    
    if (normalized < 0.25) {
        // Red to Orange (3.0 - 3.375)
        const t = normalized / 0.25;
        r = 220;
        g = Math.round(53 + (112 * t)); // 53 to 165
        b = 69;
    } else if (normalized < 0.5) {
        // Orange to Yellow (3.375 - 3.75)
        const t = (normalized - 0.25) / 0.25;
        r = Math.round(220 + (35 * t)); // 220 to 255
        g = Math.round(165 + (28 * t)); // 165 to 193
        b = 69;
    } else if (normalized < 0.75) {
        // Yellow to Light Green (3.75 - 4.125)
        const t = (normalized - 0.5) / 0.25;
        r = Math.round(255 - (105 * t)); // 255 to 150
        g = Math.round(193 + (22 * t)); // 193 to 215
        b = Math.round(69 + (51 * t)); // 69 to 120
    } else {
        // Light Green to Green (4.125 - 4.5)
        const t = (normalized - 0.75) / 0.25;
        r = Math.round(150 - (110 * t)); // 150 to 40
        g = Math.round(215 - (48 * t)); // 215 to 167
        b = Math.round(120 - (51 * t)); // 120 to 69
    }
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Update the table view
function updateTable(locations) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    locations.forEach(location => {
        const row = document.createElement('tr');
        row.onclick = () => showDetails(location.name);
        
        // Use dynamic color based on rating
        const color = getMarkerColor(location.rating);
        
        row.innerHTML = `
            <td><strong>${location.name}</strong></td>
            <td>${location.address}</td>
            <td>${location.neighborhood}</td>
            <td><span class="rating" style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 4px;">⭐ ${location.rating}</span></td>
            <td>${location.reviewCount}</td>
            <td class="key-phrases">${location.keyPhrases.join(', ')}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update sort indicators
    updateSortIndicators();
}

// Sort table by column
function sortTable(column) {
    if (sortColumn === column) {
        // Toggle direction if clicking same column
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // New column, default to ascending
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Get current filtered locations
    const currentLocations = getCurrentFilteredLocations();
    
    // Sort the locations
    const sortedLocations = [...currentLocations].sort((a, b) => {
        let aVal, bVal;
        
        switch(column) {
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            case 'neighborhood':
                aVal = a.neighborhood.toLowerCase();
                bVal = b.neighborhood.toLowerCase();
                break;
            case 'rating':
                aVal = a.rating;
                bVal = b.rating;
                break;
            case 'reviewCount':
                aVal = a.reviewCount;
                bVal = b.reviewCount;
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    updateTable(sortedLocations);
}

// Get currently filtered locations
function getCurrentFilteredLocations() {
    const searchInput = document.getElementById('searchInput');
    const neighborhoodFilter = document.getElementById('neighborhoodFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    let filtered = allLocations;
    
    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(loc => 
            loc.name.toLowerCase().includes(searchTerm) ||
            loc.address.toLowerCase().includes(searchTerm) ||
            loc.neighborhood.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply neighborhood filter
    if (neighborhoodFilter.value) {
        filtered = filtered.filter(loc => loc.neighborhood === neighborhoodFilter.value);
    }
    
    // Apply rating filter
    if (ratingFilter.value) {
        const [min, max] = ratingFilter.value.split('-').map(Number);
        filtered = filtered.filter(loc => loc.rating >= min && loc.rating < max);
    }
    
    return filtered;
}

// Update sort indicators on table headers
function updateSortIndicators() {
    // Remove all existing indicators
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        const existingArrow = th.querySelector('.sort-arrow');
        if (existingArrow) existingArrow.remove();
    });
    
    // Add indicator to current sort column
    if (sortColumn) {
        const th = document.querySelector(`th[data-sort="${sortColumn}"]`);
        if (th) {
            th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            const arrow = document.createElement('span');
            arrow.className = 'sort-arrow';
            arrow.textContent = sortDirection === 'asc' ? ' ▲' : ' ▼';
            th.appendChild(arrow);
        }
    }
}

// Show detailed modal for a location
function showDetails(locationName) {
    const location = allLocations.find(loc => loc.name === locationName);
    if (!location) return;
    
    const modal = document.getElementById('detailsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = location.name;
    
    const color = getMarkerColor(location.rating);
    
    modalBody.innerHTML = `
        <div class="location-details">
            <div class="detail-section">
                <h3>Location Information</h3>
                <p><strong>Address:</strong> ${location.address}</p>
                <p><strong>Neighborhood:</strong> ${location.neighborhood}</p>
                <p><strong>Rating:</strong> <span class="rating" style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 4px;">⭐ ${location.rating}</span></p>
                <p><strong>Total Reviews:</strong> ${location.reviewCount}</p>
            </div>
            
            <div class="detail-section">
                <h3>Key Phrases from Reviews (TF-IDF Analysis)</h3>
                <ul class="phrase-list">
                    ${location.keyPhrases.map(phrase => `<li>${phrase}</li>`).join('')}
                </ul>
                <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                    <em>These phrases are extracted using TF-IDF algorithm, which identifies 
                    significant words and phrases by analyzing their frequency in this location's 
                    reviews compared to all reviews.</em>
                </p>
            </div>
            
            <div class="detail-section">
                <h3>Sample Reviews</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${location.reviews.slice(0, 10).map(review => `
                        <p style="padding: 10px; margin: 8px 0; background: #f8f9fa; border-radius: 5px; border-left: 3px solid #667eea;">
                            "${review}"
                        </p>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Set up event listeners
function setupEventListeners() {
    // View toggle buttons
    document.getElementById('mapViewBtn').addEventListener('click', () => {
        switchView('map');
    });
    
    document.getElementById('tableViewBtn').addEventListener('click', () => {
        switchView('table');
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
    
    // Table filters
    document.getElementById('neighborhoodFilter').addEventListener('change', applyFilters);
    document.getElementById('ratingFilter').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Modal close
    const modal = document.getElementById('detailsModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Switch between map and table views
function switchView(view) {
    currentView = view;
    
    const mapView = document.getElementById('mapView');
    const tableView = document.getElementById('tableView');
    const tableFilters = document.getElementById('tableFilters');
    const mapBtn = document.getElementById('mapViewBtn');
    const tableBtn = document.getElementById('tableViewBtn');
    
    if (view === 'map') {
        mapView.style.display = 'block';
        tableView.style.display = 'none';
        tableFilters.style.display = 'none';
        mapBtn.classList.add('btn-active');
        tableBtn.classList.remove('btn-active');
        
        // Refresh map
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    } else {
        mapView.style.display = 'none';
        tableView.style.display = 'block';
        tableFilters.style.display = 'flex';
        mapBtn.classList.remove('btn-active');
        tableBtn.classList.add('btn-active');
    }
}

// Populate filter dropdowns
function populateFilters() {
    const neighborhoodFilter = document.getElementById('neighborhoodFilter');
    const neighborhoods = [...new Set(allLocations.map(loc => loc.neighborhood))].sort();
    
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.value = neighborhood;
        option.textContent = neighborhood;
        neighborhoodFilter.appendChild(option);
    });
}

// Apply filters to table
function applyFilters() {
    const neighborhoodFilter = document.getElementById('neighborhoodFilter').value;
    const ratingFilter = document.getElementById('ratingFilter').value;
    const searchQuery = document.getElementById('searchInput').value;
    
    let filtered = allLocations;
    
    // Apply search first
    if (searchQuery.trim()) {
        filtered = filtered.filter(location => 
            location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.keyPhrases.some(phrase => phrase.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }
    
    // Apply neighborhood filter
    if (neighborhoodFilter) {
        filtered = filtered.filter(loc => loc.neighborhood === neighborhoodFilter);
    }
    
    // Apply rating filter
    if (ratingFilter) {
        const [min, max] = ratingFilter.split('-').map(parseFloat);
        filtered = filtered.filter(loc => loc.rating >= min && loc.rating <= max);
    }
    
    // If there's an active sort, re-sort the filtered results
    if (sortColumn) {
        filtered = [...filtered].sort((a, b) => {
            let aVal, bVal;
            
            switch(sortColumn) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'neighborhood':
                    aVal = a.neighborhood.toLowerCase();
                    bVal = b.neighborhood.toLowerCase();
                    break;
                case 'rating':
                    aVal = a.rating;
                    bVal = b.rating;
                    break;
                case 'reviewCount':
                    aVal = a.reviewCount;
                    bVal = b.reviewCount;
                    break;
                default:
                    return 0;
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    displayMarkers(filtered);
    updateTable(filtered);
}

// Clear all filters
function clearFilters() {
    document.getElementById('neighborhoodFilter').value = '';
    document.getElementById('ratingFilter').value = '';
    document.getElementById('searchInput').value = '';
    sortColumn = null;
    sortDirection = 'asc';
    displayMarkers(allLocations);
    updateTable(allLocations);
}

// Handle search
function handleSearch(query) {
    applyFilters(); // Use unified filter system
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = formatted;
}
