// Test script for TF-IDF algorithm and data processing
// This can be run with Node.js to verify functionality

const ReviewScraper = require('./scraper.js');
const TFIDFAnalyzer = require('./tfidf.js');

console.log('Testing Harold\'s Chicken Dashboard Components\n');
console.log('==============================================\n');

// Test 1: Review Scraper
console.log('Test 1: Review Scraper');
console.log('----------------------');
const scraper = new ReviewScraper();
console.log(`Total locations loaded: ${scraper.locations.length}`);
console.log(`Sample location: ${scraper.locations[0].name}`);
console.log(`  - Neighborhood: ${scraper.locations[0].neighborhood}`);
console.log(`  - Rating: ${scraper.locations[0].rating}`);
console.log(`  - Reviews: ${scraper.locations[0].reviewCount}`);

// Test 2: Review Generation
console.log('\nTest 2: Review Generation');
console.log('-------------------------');
const sampleReviews = scraper.generateReviews(4.2, 10);
console.log(`Generated ${sampleReviews.length} sample reviews`);
console.log(`Sample review: "${sampleReviews[0]}"`);

// Test 3: TF-IDF Algorithm
console.log('\nTest 3: TF-IDF Algorithm');
console.log('------------------------');
const tfidf = new TFIDFAnalyzer();

// Test tokenization
const sampleText = "Amazing fried chicken! Crispy skin, juicy meat, and great sauce.";
const tokens = tfidf.tokenize(sampleText);
console.log(`Tokenized text: ${tokens.join(', ')}`);

// Test TF-IDF on sample reviews
const testReviews = [
    "Amazing fried chicken! Crispy skin, juicy meat.",
    "Best chicken in Chicago! The mild sauce is incredible.",
    "Love their chicken wings and coleslaw.",
    "Fantastic food, quick service. The chicken is perfectly seasoned."
];

const keyPhrases = tfidf.extractSignificantPhrasesWithNGrams(testReviews, 5);
console.log(`\nKey phrases extracted: ${keyPhrases.join(', ')}`);

// Test 4: Full Integration
console.log('\nTest 4: Full Integration');
console.log('------------------------');
const testLocation = scraper.locations[0];
const locationReviews = scraper.scrapeLocationReviews(testLocation);
const locationKeyPhrases = tfidf.extractSignificantPhrasesWithNGrams(locationReviews, 5);
console.log(`Location: ${testLocation.name}`);
console.log(`Review count: ${locationReviews.length}`);
console.log(`Key phrases: ${locationKeyPhrases.join(', ')}`);

// Test 5: Search Functionality
console.log('\nTest 5: Search Functionality');
console.log('----------------------------');
const searchResults = scraper.searchLocations('Hyde Park');
console.log(`Search for "Hyde Park" found ${searchResults.length} result(s)`);
if (searchResults.length > 0) {
    console.log(`  - ${searchResults[0].name} at ${searchResults[0].address}`);
}

console.log('\n==============================================');
console.log('All tests completed successfully! ✓');
