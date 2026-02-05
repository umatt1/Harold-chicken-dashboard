#!/usr/bin/env node

// Real Google Places API scraper that saves data to data.json
// This script fetches actual review data and saves it for the static site to use

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Search for all Harold's Chicken locations in Chicago
async function findAllHaroldsLocations() {
    try {
        console.log('🔍 Searching for all Harold\'s Chicken locations in Chicago...\n');
        
        let allLocations = [];
        let nextPageToken = null;
        let pageCount = 0;
        
        do {
            const params = {
                query: "Harold's Chicken Chicago",
                key: GOOGLE_PLACES_API_KEY
            };
            
            if (nextPageToken) {
                params.pagetoken = nextPageToken;
                // Google requires a short delay before requesting next page
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
                params
            });

            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                console.error('❌ Search failed:', response.data.status);
                if (response.data.error_message) {
                    console.error('   Error:', response.data.error_message);
                }
                break;
            }

            if (response.data.results && response.data.results.length > 0) {
                const locations = response.data.results.map(place => ({
                    name: place.name,
                    address: place.formatted_address,
                    neighborhood: extractNeighborhood(place.formatted_address),
                    placeId: place.place_id,
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                    rating: place.rating || 0,
                    reviewCount: place.user_ratings_total || 0
                }));
                
                allLocations = allLocations.concat(locations);
                pageCount++;
                console.log(`   Page ${pageCount}: Found ${locations.length} locations (Total: ${allLocations.length})`);
            }

            nextPageToken = response.data.next_page_token || null;
            
        } while (nextPageToken);

        console.log(`\n✅ Found ${allLocations.length} Harold's Chicken locations total\n`);
        return allLocations;
        
    } catch (error) {
        console.error('❌ Error searching for locations:', error.message);
        return [];
    }
}

// Extract neighborhood from address (simplified - gets the neighborhood/area name)
function extractNeighborhood(address) {
    // Chicago addresses format: "Street, Chicago, IL ZIP"
    // Try to extract neighborhood from context or use general area
    const parts = address.split(',');
    if (parts.length >= 2) {
        // Return the area before "Chicago" or use zip code area
        const zipMatch = address.match(/IL\s+(\d{5})/);
        if (zipMatch) {
            // Map Chicago area zip codes to neighborhoods
            const zipToNeighborhood = {
                // Chicago proper
                '60605': 'South Loop',
                '60607': 'West Loop',
                '60616': 'South Loop',
                '60653': 'Bronzeville',
                '60637': 'Woodlawn',
                '60649': 'South Shore',
                '60636': 'Englewood',
                '60619': 'Chatham',
                '60615': 'Hyde Park',
                '60644': 'Austin',
                '60620': 'Auburn Gresham',
                '60651': 'West Garfield Park',
                '60617': 'South Chicago',
                '60628': 'Roseland',
                '60652': 'Ashburn',
                '60643': 'Beverly',
                '60621': 'Englewood',
                '60624': 'West Garfield Park',
                '60622': 'Wicker Park',
                '60640': 'Uptown',
                '60629': 'Chicago Lawn',
                '60618': 'Avondale',
                '60661': 'West Loop',
                // Suburbs
                '60402': 'Berwyn',
                '60453': 'Oak Lawn',
                '60153': 'Maywood',
                '60805': 'Evergreen Park',
                '60452': 'Oak Forest',
                '60411': 'Chicago Heights',
                '60202': 'Evanston',
                '60445': 'Crestwood',
                '60419': 'Dolton',
                '60803': 'Alsip',
                '62703': 'Springfield'
            };
            return zipToNeighborhood[zipMatch[1]] || 'Chicago';
        }
    }
    return 'Chicago';
}

// Get place details including reviews (using new Places API for more reviews)
async function getPlaceDetails(placeId) {
    try {
        // The new Places API returns up to 5 "most relevant" reviews by default
        // To get more reviews, we need to make multiple requests with different language codes
        // and combine the unique results
        const allReviews = [];
        const seenTexts = new Set();
        
        // Try different language codes to potentially get different sets of reviews
        const languageCodes = ['en', 'es', 'pl', 'zh', 'ar', 'ko', 'vi', 'tl', 'hi', 'ur']; // Major languages in Chicago
        
        let placeDetails = null;
        
        for (const lang of languageCodes) {
            try {
                const response = await axios.get(
                    `https://places.googleapis.com/v1/places/${placeId}`,
                    {
                        headers: {
                            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                            'X-Goog-FieldMask': 'displayName,formattedAddress,location,rating,userRatingCount,reviews.text,reviews.rating,reviews.relativePublishTimeDescription,reviews.authorAttribution'
                        },
                        params: {
                            languageCode: lang
                        }
                    }
                );

                if (response.data) {
                    const data = response.data;
                    
                    // Store place details on first successful request
                    if (!placeDetails) {
                        placeDetails = {
                            name: data.displayName?.text,
                            formatted_address: data.formattedAddress,
                            geometry: {
                                location: {
                                    lat: data.location?.latitude,
                                    lng: data.location?.longitude
                                }
                            },
                            rating: data.rating,
                            user_ratings_total: data.userRatingCount
                        };
                    }
                    
                    // Collect unique reviews
                    if (data.reviews && data.reviews.length > 0) {
                        data.reviews.forEach(review => {
                            const text = review.text?.text || review.originalText?.text || '';
                            // Use first 100 chars as unique identifier to avoid exact duplicates
                            const textKey = text.substring(0, 100).trim().toLowerCase();
                            if (text && !seenTexts.has(textKey)) {
                                seenTexts.add(textKey);
                                allReviews.push({
                                    text: text,
                                    rating: review.rating,
                                    time: review.relativePublishTimeDescription
                                });
                            }
                        });
                    }
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 150));
                
            } catch (langError) {
                // Silently continue if a language fails
                console.log(`   ℹ️  Language ${lang} failed, continuing...`);
            }
        }
        
        if (placeDetails && allReviews.length > 0) {
            placeDetails.reviews = allReviews;
            console.log(`   ✅ New API: Found ${allReviews.length} unique reviews`);
            return placeDetails;
        }
        
        throw new Error('New API failed to get reviews');
        
    } catch (newApiError) {
        // If new API fails, fall back to old API
        console.log(`   ℹ️  New API failed (${newApiError.response?.status || newApiError.message}), using standard API (5 review limit)`);
        
        try {
            const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
                params: {
                    place_id: placeId,
                    fields: 'name,formatted_address,geometry,rating,user_ratings_total,reviews',
                    key: GOOGLE_PLACES_API_KEY
                }
            });

            if (response.data.status !== 'OK') {
                console.error(`   ⚠️  API Status: ${response.data.status}`);
                if (response.data.error_message) {
                    console.error(`   ⚠️  Error: ${response.data.error_message}`);
                }
            }

            if (response.data.result) {
                return response.data.result;
            }
            return null;
        } catch (error) {
            console.error(`   ❌ Error getting details for place ${placeId}:`, error.message);
            return null;
        }
    }
}

// Main scraper function
async function scrapeAllLocations() {
    console.log('🔍 Starting to fetch Harold\'s Chicken locations...\n');

    if (!GOOGLE_PLACES_API_KEY) {
        console.error('❌ Error: GOOGLE_PLACES_API_KEY environment variable not set');
        console.error('Please create a .env file with your Google Places API key');
        process.exit(1);
    }

    // First, find all Harold's Chicken locations
    const locations = await findAllHaroldsLocations();
    
    if (locations.length === 0) {
        console.error('❌ No Harold\'s Chicken locations found');
        return [];
    }

    const results = [];

    for (const location of locations) {
        console.log(`📍 Fetching details: ${location.name}`);
        console.log(`   Address: ${location.address}`);

        // Get detailed information including reviews
        const details = await getPlaceDetails(location.placeId);
        if (!details) {
            console.log(`   ⚠️  Could not get details, using basic info...\n`);
            // Still add the location with basic info
            results.push({
                name: location.name,
                address: location.address,
                neighborhood: location.neighborhood,
                lat: location.lat,
                lng: location.lng,
                rating: location.rating,
                reviewCount: location.reviewCount,
                reviews: []
            });
            continue;
        }

        // Extract review texts (requires billing to be enabled)
        const reviews = details.reviews 
            ? details.reviews.map(review => review.text)
            : [];

        const locationData = {
            name: location.name,
            address: details.formatted_address || location.address,
            neighborhood: location.neighborhood,
            lat: details.geometry?.location?.lat || location.lat,
            lng: details.geometry?.location?.lng || location.lng,
            rating: details.rating || location.rating,
            reviewCount: details.user_ratings_total || location.reviewCount,
            reviews: reviews
        };

        results.push(locationData);
        console.log(`   ✅ Found ${reviews.length} reviews (Rating: ${locationData.rating})\n`);

        // Rate limiting - wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
}

// Save results to data.json
async function saveToFile(data) {
    const output = {
        lastUpdated: new Date().toISOString(),
        locations: data
    };

    fs.writeFileSync('data.json', JSON.stringify(output, null, 2));
    console.log(`\n✅ Successfully saved ${data.length} locations to data.json`);
    console.log(`📅 Last updated: ${output.lastUpdated}`);
}

// Run the scraper
(async () => {
    try {
        const locations = await scrapeAllLocations();
        await saveToFile(locations);
    } catch (error) {
        console.error('❌ Error running scraper:', error);
        process.exit(1);
    }
})();
