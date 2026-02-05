#!/usr/bin/env node

// Test Google Places API with a well-known location
const axios = require('axios');
require('dotenv').config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function testAPI() {
    console.log('🧪 Testing Google Places API...\n');

    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'your_api_key_here') {
        console.error('❌ Please set a valid GOOGLE_PLACES_API_KEY in .env file');
        process.exit(1);
    }

    console.log('🔑 API Key found (first 10 chars):', GOOGLE_PLACES_API_KEY.substring(0, 10) + '...\n');

    // Test with a famous Chicago restaurant - Lou Malnati's
    const testAddress = "439 N Wells St, Chicago, IL 60654"; // Lou Malnati's downtown
    
    try {
        console.log('📍 Testing with:', testAddress);
        
        // Step 1: Find place
        const searchResponse = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
            params: {
                input: testAddress,
                inputtype: 'textquery',
                fields: 'place_id,name,rating,user_ratings_total',
                key: GOOGLE_PLACES_API_KEY
            }
        });

        console.log('\n📋 Search API Status:', searchResponse.data.status);
        
        if (searchResponse.data.status !== 'OK') {
            console.error('❌ Error:', searchResponse.data.error_message || 'Unknown error');
            console.error('Full response:', JSON.stringify(searchResponse.data, null, 2));
            process.exit(1);
        }

        const place = searchResponse.data.candidates[0];
        console.log('✅ Found:', place.name);
        console.log('   Place ID:', place.place_id);
        console.log('   Rating:', place.rating || 'N/A');
        console.log('   Total ratings:', place.user_ratings_total || 0);

        // Step 2: Get details with reviews
        console.log('\n📍 Fetching detailed information with reviews...');
        
        const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: place.place_id,
                fields: 'name,rating,user_ratings_total,reviews',
                key: GOOGLE_PLACES_API_KEY
            }
        });

        console.log('📋 Details API Status:', detailsResponse.data.status);
        
        if (detailsResponse.data.status !== 'OK') {
            console.error('❌ Error:', detailsResponse.data.error_message || 'Unknown error');
            console.error('Full response:', JSON.stringify(detailsResponse.data, null, 2));
            process.exit(1);
        }

        const details = detailsResponse.data.result;
        console.log('✅ Details retrieved:');
        console.log('   Name:', details.name);
        console.log('   Rating:', details.rating || 'N/A');
        console.log('   Total ratings:', details.user_ratings_total || 0);
        console.log('   Reviews returned:', details.reviews?.length || 0);

        if (details.reviews && details.reviews.length > 0) {
            console.log('\n📝 Sample review:');
            console.log('   ', details.reviews[0].text.substring(0, 100) + '...');
            console.log('\n✅ API is working correctly!');
        } else {
            console.log('\n⚠️  No reviews returned. Possible reasons:');
            console.log('   - Billing not enabled on Google Cloud project');
            console.log('   - API restrictions too strict');
            console.log('   - This specific location has no reviews');
        }

    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testAPI();
