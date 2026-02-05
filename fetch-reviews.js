#!/usr/bin/env node

// Real Google Places API scraper that saves data to data.json
// This script fetches actual review data and saves it for the static site to use

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Harold's Chicken locations to fetch reviews for
const LOCATIONS = [
    {
        name: "Harold's Chicken Shack #1",
        address: "338 E 47th St, Chicago, IL 60653",
        neighborhood: "Bronzeville",
        placeId: null // Will be found via search
    },
    {
        name: "Harold's Chicken #2",
        address: "6458 S Cottage Grove Ave, Chicago, IL 60637",
        neighborhood: "Woodlawn",
        placeId: null
    },
    {
        name: "Harold's Chicken Shack #3",
        address: "7159 S Stony Island Ave, Chicago, IL 60649",
        neighborhood: "South Shore",
        placeId: null
    },
    {
        name: "Harold's Chicken #4",
        address: "6316 S Western Ave, Chicago, IL 60636",
        neighborhood: "Chicago Lawn",
        placeId: null
    },
    {
        name: "Harold's Chicken Shack #5",
        address: "645 E 87th St, Chicago, IL 60619",
        neighborhood: "Chatham",
        placeId: null
    },
    {
        name: "Harold's Chicken #6",
        address: "8459 S Cottage Grove Ave, Chicago, IL 60619",
        neighborhood: "Chatham",
        placeId: null
    },
    {
        name: "Harold's Chicken Shack #7",
        address: "3801 S Indiana Ave, Chicago, IL 60653",
        neighborhood: "Grand Boulevard",
        placeId: null
    },
    {
        name: "Harold's Chicken #8",
        address: "1208 E 53rd St, Chicago, IL 60615",
        neighborhood: "Hyde Park",
        placeId: null
    },
    {
        name: "Harold's Chicken Shack #9",
        address: "5351 W Madison St, Chicago, IL 60644",
        neighborhood: "Austin",
        placeId: null
    },
    {
        name: "Harold's Chicken #10",
        address: "7044 S Ashland Ave, Chicago, IL 60636",
        neighborhood: "Englewood",
        placeId: null
    }
];

// Find place by address using Google Places API
async function findPlaceByAddress(address) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
            params: {
                input: address,
                inputtype: 'textquery',
                fields: 'place_id,name,geometry,rating,user_ratings_total,business_status',
                key: GOOGLE_PLACES_API_KEY
            }
        });

        if (response.data.candidates && response.data.candidates.length > 0) {
            return response.data.candidates[0];
        }
        return null;
    } catch (error) {
        console.error(`   ❌ Error finding place for ${address}:`, error.message);
        return null;
    }
}

// Get place details including reviews
async function getPlaceDetails(placeId) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: placeId,
                fields: 'name,formatted_address,geometry,rating,user_ratings_total,reviews',
                key: GOOGLE_PLACES_API_KEY
            }
        });

        // Log API response status
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
        if (error.response) {
            console.error(`   ❌ Status: ${error.response.status}`, error.response.data);
        }
        return null;
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

    const results = [];

    for (const location of LOCATIONS) {
        console.log(`📍 Fetching: ${location.name} (${location.address})`);

        // Search using business name + city for better results
        const searchQuery = `${location.name} ${location.address}`;
        const place = await findPlaceByAddress(searchQuery);
        
        if (!place) {
            console.log(`   ⚠️  Could not find place, skipping...\n`);
            continue;
        }
        
        console.log(`   Found: "${place.name}" (Status: ${place.business_status || 'unknown'})`);

        // Get detailed information including reviews
        const details = await getPlaceDetails(place.place_id);
        if (!details) {
            console.log(`   ⚠️  Could not get details, skipping...\n`);
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
            lat: details.geometry?.location?.lat || place.geometry?.location?.lat || 0,
            lng: details.geometry?.location?.lng || place.geometry?.location?.lng || 0,
            rating: details.rating || 0,
            reviewCount: details.user_ratings_total || 0,
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
