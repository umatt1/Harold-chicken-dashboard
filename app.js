// Main Application Logic
let map;
let markers = [];
let allLocations = [];
let currentView = 'map';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Harold\'s Chicken Dashboard...');
    
    // Initialize map
    initMap();
    
    // Load data
    await loadData();
    
    // Set up event listeners
    setupEventListeners();
    
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
                <button onclick="showDetails('${location.name}')" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">View Details</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        markers.push(marker);
    });
}

// Get marker color based on rating
function getMarkerColor(rating) {
    if (rating >= 4.0) return '#28a745'; // Green
    if (rating >= 3.0) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
}

// Update the table view
function updateTable(locations) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    locations.forEach(location => {
        const row = document.createElement('tr');
        row.onclick = () => showDetails(location.name);
        
        const ratingClass = location.rating >= 4.0 ? 'high' : location.rating >= 3.0 ? 'medium' : 'low';
        
        row.innerHTML = `
            <td><strong>${location.name}</strong></td>
            <td>${location.address}</td>
            <td>${location.neighborhood}</td>
            <td><span class="rating ${ratingClass}">⭐ ${location.rating}</span></td>
            <td>${location.reviewCount}</td>
            <td class="key-phrases">${location.keyPhrases.join(', ')}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Show detailed modal for a location
function showDetails(locationName) {
    const location = allLocations.find(loc => loc.name === locationName);
    if (!location) return;
    
    const modal = document.getElementById('detailsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = location.name;
    
    const ratingClass = location.rating >= 4.0 ? 'high' : location.rating >= 3.0 ? 'medium' : 'low';
    
    modalBody.innerHTML = `
        <div class="location-details">
            <div class="detail-section">
                <h3>Location Information</h3>
                <p><strong>Address:</strong> ${location.address}</p>
                <p><strong>Neighborhood:</strong> ${location.neighborhood}</p>
                <p><strong>Rating:</strong> <span class="rating ${ratingClass}">⭐ ${location.rating}</span></p>
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
    const mapBtn = document.getElementById('mapViewBtn');
    const tableBtn = document.getElementById('tableViewBtn');
    
    if (view === 'map') {
        mapView.style.display = 'block';
        tableView.style.display = 'none';
        mapBtn.classList.add('btn-active');
        tableBtn.classList.remove('btn-active');
        
        // Refresh map
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    } else {
        mapView.style.display = 'none';
        tableView.style.display = 'block';
        mapBtn.classList.remove('btn-active');
        tableBtn.classList.add('btn-active');
    }
}

// Handle search
function handleSearch(query) {
    if (!query.trim()) {
        // Show all locations
        displayMarkers(allLocations);
        updateTable(allLocations);
        return;
    }
    
    const filtered = allLocations.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.neighborhood.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase()) ||
        location.keyPhrases.some(phrase => phrase.toLowerCase().includes(query.toLowerCase()))
    );
    
    displayMarkers(filtered);
    updateTable(filtered);
    
    // If in map view and results found, fit bounds
    if (currentView === 'map' && filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(loc => [loc.lat, loc.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }
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
