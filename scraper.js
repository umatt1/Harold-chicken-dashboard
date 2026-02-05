// Google Reviews Scraper (Simulated)
// In production, this would connect to Google Places API or scrape real data
// For this demo, we generate sample data based on known Harold's Chicken locations

class ReviewScraper {
    constructor() {
        // Sample Harold's Chicken locations in Chicago
        this.locations = [
            {
                name: "Harold's Chicken Shack #1",
                address: "338 E 47th St, Chicago, IL 60653",
                neighborhood: "Bronzeville",
                lat: 41.8094,
                lng: -87.6166,
                rating: 4.2,
                reviewCount: 342
            },
            {
                name: "Harold's Chicken #2",
                address: "6458 S Cottage Grove Ave, Chicago, IL 60637",
                neighborhood: "Woodlawn",
                lat: 41.7757,
                lng: -87.6060,
                rating: 4.0,
                reviewCount: 287
            },
            {
                name: "Harold's Chicken Shack #3",
                address: "7159 S Stony Island Ave, Chicago, IL 60649",
                neighborhood: "South Shore",
                lat: 41.7622,
                lng: -87.5861,
                rating: 3.8,
                reviewCount: 219
            },
            {
                name: "Harold's Chicken #4",
                address: "6316 S Western Ave, Chicago, IL 60636",
                neighborhood: "Chicago Lawn",
                lat: 41.7784,
                lng: -87.6837,
                rating: 4.3,
                reviewCount: 412
            },
            {
                name: "Harold's Chicken Shack #5",
                address: "645 E 87th St, Chicago, IL 60619",
                neighborhood: "Chatham",
                lat: 41.7364,
                lng: -87.6092,
                rating: 3.9,
                reviewCount: 298
            },
            {
                name: "Harold's Chicken #6",
                address: "8459 S Cottage Grove Ave, Chicago, IL 60619",
                neighborhood: "Chatham",
                lat: 41.7394,
                lng: -87.6060,
                rating: 4.1,
                reviewCount: 365
            },
            {
                name: "Harold's Chicken Shack #7",
                address: "3801 S Indiana Ave, Chicago, IL 60653",
                neighborhood: "Grand Boulevard",
                lat: 41.8249,
                lng: -87.6214,
                rating: 4.4,
                reviewCount: 523
            },
            {
                name: "Harold's Chicken #8",
                address: "1208 E 53rd St, Chicago, IL 60615",
                neighborhood: "Hyde Park",
                lat: 41.7992,
                lng: -87.5965,
                rating: 4.5,
                reviewCount: 678
            },
            {
                name: "Harold's Chicken Shack #9",
                address: "5351 W Madison St, Chicago, IL 60644",
                neighborhood: "Austin",
                lat: 41.8803,
                lng: -87.7599,
                rating: 3.7,
                reviewCount: 201
            },
            {
                name: "Harold's Chicken #10",
                address: "7044 S Ashland Ave, Chicago, IL 60636",
                neighborhood: "Englewood",
                lat: 41.7650,
                lng: -87.6645,
                rating: 3.5,
                reviewCount: 156
            }
        ];

        // Sample review templates for generating realistic reviews
        this.reviewTemplates = {
            positive: [
                "Amazing fried chicken! Crispy skin, juicy meat, and great sauce.",
                "Best chicken in Chicago! The mild sauce is incredible.",
                "Always fresh and hot. Love their chicken wings and coleslaw.",
                "Fantastic food, quick service. The chicken is perfectly seasoned.",
                "Delicious comfort food. The fried chicken is crispy and flavorful.",
                "Great portions, reasonable prices. Chicken is always on point.",
                "Love this place! Best fried chicken and fries in the neighborhood.",
                "Quick service, tasty food. The chicken sandwich is amazing.",
                "Perfectly fried chicken every time. Great value for money.",
                "Classic Chicago spot. Crispy chicken, good sauce, friendly staff."
            ],
            mixed: [
                "Good chicken but service can be slow during busy times.",
                "Chicken is tasty but sometimes the wait is long.",
                "Decent food, reasonable prices. Hit or miss on freshness.",
                "The chicken is usually good but inconsistent quality.",
                "Nice crispy skin but meat can be a bit dry sometimes.",
                "Popular spot, good chicken but parking is difficult.",
                "Food is okay, portions are generous. Service varies.",
                "Average fried chicken. Nothing special but fills you up.",
                "Chicken is decent when fresh. Fries could be better.",
                "Good comfort food but not the best I've had."
            ],
            negative: [
                "Chicken was cold and service was poor. Disappointing.",
                "Not fresh, waited too long, and food was greasy.",
                "Overpriced for the quality. Chicken was dry.",
                "Poor service and food was not hot. Not recommended.",
                "Chicken was soggy and bland. Very disappointed.",
                "Long wait times and mediocre food. Expected better.",
                "Greasy, overcooked chicken. Not worth the price.",
                "Terrible experience. Cold food and rude staff.",
                "Dry chicken, stale fries. Won't be coming back.",
                "Not impressed. Chicken was tough and flavorless."
            ]
        };
    }

    // Generate sample reviews based on rating
    generateReviews(rating, count) {
        const reviews = [];
        
        for (let i = 0; i < count; i++) {
            let template;
            const rand = Math.random();
            
            if (rating >= 4.0) {
                // Mostly positive reviews
                if (rand < 0.8) template = this.reviewTemplates.positive;
                else if (rand < 0.95) template = this.reviewTemplates.mixed;
                else template = this.reviewTemplates.negative;
            } else if (rating >= 3.5) {
                // Mix of reviews
                if (rand < 0.5) template = this.reviewTemplates.positive;
                else if (rand < 0.85) template = this.reviewTemplates.mixed;
                else template = this.reviewTemplates.negative;
            } else {
                // Mostly mixed/negative
                if (rand < 0.3) template = this.reviewTemplates.positive;
                else if (rand < 0.7) template = this.reviewTemplates.mixed;
                else template = this.reviewTemplates.negative;
            }
            
            const randomReview = template[Math.floor(Math.random() * template.length)];
            reviews.push(randomReview);
        }
        
        return reviews;
    }

    // Scrape (simulate) reviews for a location
    scrapeLocationReviews(location) {
        // Generate sample reviews based on review count
        const sampleSize = Math.min(location.reviewCount, 50); // Limit to 50 reviews for demo
        return this.generateReviews(location.rating, sampleSize);
    }

    // Get all locations with reviews
    async getAllLocationsWithReviews() {
        // Simulate async API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return this.locations.map(location => ({
            ...location,
            reviews: this.scrapeLocationReviews(location)
        }));
    }

    // Search locations by neighborhood or name
    searchLocations(query) {
        const searchTerm = query.toLowerCase();
        return this.locations.filter(loc => 
            loc.name.toLowerCase().includes(searchTerm) ||
            loc.neighborhood.toLowerCase().includes(searchTerm) ||
            loc.address.toLowerCase().includes(searchTerm)
        );
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReviewScraper;
}
