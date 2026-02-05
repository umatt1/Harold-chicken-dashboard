# Harold's Chicken Dashboard - Setup Guide

## 🔧 Setting Up Real Google Reviews Data

This dashboard can now fetch real Google Reviews data instead of using simulated data!

### Prerequisites

1. **Google Places API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Create a new project (or use existing)
   - Enable the **Places API**
   - Create credentials → API Key
   - Restrict the key to "Places API" for security

2. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

### Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your API key to `.env`:**
   ```
   GOOGLE_PLACES_API_KEY=your_actual_api_key_here
   ```

4. **Run the scraper:**
   ```bash
   npm run scrape
   ```
   
   This will create `data.json` with real review data.

5. **Start the local server:**
   ```bash
   npm run serve
   ```
   
   Visit http://localhost:8000

### GitHub Setup for Daily Updates

1. **Add your API key as a GitHub Secret:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GOOGLE_PLACES_API_KEY`
   - Value: Your actual API key
   - Click "Add secret"

2. **The workflow will automatically:**
   - Run daily at 2 AM UTC
   - Fetch fresh review data
   - Commit updated `data.json`
   - GitHub Pages will deploy the updated site

3. **Manual trigger (optional):**
   - Go to Actions tab
   - Select "Scrape Google Reviews Daily"
   - Click "Run workflow"

### How It Works

```
┌─────────────────────┐
│  GitHub Action      │
│  (runs daily)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  fetch-reviews.js   │ ← Uses Google Places API
│  (Node.js script)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    data.json        │ ← Saved to repo
│  (review data)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   GitHub Pages      │
│  (static hosting)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    app.js           │ ← Loads data.json
│  (frontend)         │
└─────────────────────┘
```

### Files Changed

- ✅ `fetch-reviews.js` - New scraper that fetches real Google data
- ✅ `package.json` - Added Node.js dependencies
- ✅ `app.js` - Modified to load from `data.json` instead of `scraper.js`
- ✅ `index.html` - Removed `scraper.js` dependency
- ✅ `.github/workflows/scrape-reviews.yml` - Daily automation
- ✅ `.env.example` - Example environment variables

### Cost Considerations

Google Places API pricing (as of 2024):
- **Place Search**: $32 per 1000 requests
- **Place Details**: $17 per 1000 requests

Running daily for 10 locations ≈ 20 API calls/day = ~$1/month

Set up billing alerts in Google Cloud Console to monitor usage.

### Troubleshooting

**Error: GOOGLE_PLACES_API_KEY not set**
- Make sure you created `.env` file with your API key

**Error: 403 Forbidden**
- Check that Places API is enabled in Google Cloud Console
- Verify API key restrictions aren't too strict

**No reviews found**
- Some locations may not have Google Place IDs
- Try searching for them manually in Google Maps first

**Rate limiting**
- The scraper includes 200ms delays between requests
- Increase delay if you hit rate limits

### Development vs Production

- **Local**: Uses `.env` file (git-ignored)
- **GitHub Actions**: Uses repository secrets
- **Never commit** your API key to the repository!
