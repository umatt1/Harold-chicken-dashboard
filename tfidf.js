// TF-IDF Algorithm for extracting significant phrases from reviews
// TF = Term Frequency (measures how often a term appears in a document)
// IDF = Inverse Document Frequency (measures how unique/significant a term is across all documents)
// TF-IDF Score = TF × IDF (identifies significant terms by balancing frequency with uniqueness)

class TFIDFAnalyzer {
    constructor() {
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
            'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their',
            'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its',
            'our', 'as', 'if', 'so', 'than', 'such', 'no', 'not', 'very', 'just'
        ]);
    }

    // Tokenize and clean text
    tokenize(text) {
        if (!text) return [];
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !this.stopWords.has(word));
    }

    // Calculate term frequency for a document
    calculateTF(tokens) {
        const tf = {};
        const totalTokens = tokens.length;
        
        tokens.forEach(token => {
            tf[token] = (tf[token] || 0) + 1;
        });
        
        // Normalize by document length
        Object.keys(tf).forEach(token => {
            tf[token] = tf[token] / totalTokens;
        });
        
        return tf;
    }

    // Calculate inverse document frequency across all documents
    calculateIDF(documents) {
        const idf = {};
        const totalDocs = documents.length;
        
        // Count documents containing each term
        const docFrequency = {};
        documents.forEach(doc => {
            const uniqueTokens = new Set(doc);
            uniqueTokens.forEach(token => {
                docFrequency[token] = (docFrequency[token] || 0) + 1;
            });
        });
        
        // Calculate IDF: log(total docs / docs containing term)
        Object.keys(docFrequency).forEach(token => {
            idf[token] = Math.log(totalDocs / docFrequency[token]);
        });
        
        return idf;
    }

    // Calculate TF-IDF scores
    calculateTFIDF(documents) {
        const tokenizedDocs = documents.map(doc => this.tokenize(doc));
        const idf = this.calculateIDF(tokenizedDocs);
        
        return tokenizedDocs.map(tokens => {
            const tf = this.calculateTF(tokens);
            const tfidf = {};
            
            Object.keys(tf).forEach(token => {
                tfidf[token] = tf[token] * (idf[token] || 0);
            });
            
            return tfidf;
        });
    }

    // Extract top N significant phrases from reviews
    extractSignificantPhrases(reviews, topN = 5) {
        if (!reviews || reviews.length === 0) {
            return [];
        }

        const tfidfScores = this.calculateTFIDF(reviews);
        
        // Aggregate scores across all reviews
        const aggregatedScores = {};
        tfidfScores.forEach(docScores => {
            Object.keys(docScores).forEach(term => {
                aggregatedScores[term] = (aggregatedScores[term] || 0) + docScores[term];
            });
        });

        // Sort by score and get top N
        const sortedTerms = Object.entries(aggregatedScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN)
            .map(entry => entry[0]);

        return sortedTerms;
    }

    // Generate n-grams (phrases) from text
    generateNGrams(text, n = 2) {
        const tokens = this.tokenize(text);
        const ngrams = [];
        
        for (let i = 0; i <= tokens.length - n; i++) {
            ngrams.push(tokens.slice(i, i + n).join(' '));
        }
        
        return ngrams;
    }

    // Extract significant phrases including n-grams
    extractSignificantPhrasesWithNGrams(reviews, topN = 5) {
        if (!reviews || reviews.length === 0) {
            return [];
        }

        // Extract single words
        const singleWords = this.extractSignificantPhrases(reviews, topN);
        
        // Extract bigrams
        const allBigrams = [];
        reviews.forEach(review => {
            allBigrams.push(...this.generateNGrams(review, 2));
        });
        
        // Count bigram frequency
        const bigramFreq = {};
        allBigrams.forEach(bigram => {
            if (bigram.split(' ').length === 2) { // Ensure valid bigram
                bigramFreq[bigram] = (bigramFreq[bigram] || 0) + 1;
            }
        });
        
        // Get top bigrams
        const topBigrams = Object.entries(bigramFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, Math.ceil(topN / 2))
            .map(entry => entry[0]);
        
        // Combine and return unique phrases
        const allPhrases = [...new Set([...topBigrams, ...singleWords])];
        return allPhrases.slice(0, topN);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TFIDFAnalyzer;
}
