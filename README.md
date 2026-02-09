# 🍗 Harold's Chicken Shack - Chicago Locations Dashboard

An interactive dashboard showcasing Harold's Chicken Shack locations across Chicago, featuring quality ratings, neighborhood information, and review analysis using TF-IDF algorithm.

## ✨ Features

- 🗺️ **Interactive Map View**: Visualize all Harold's Chicken locations on an interactive map with color-coded markers based on quality ratings
- 📊 **Table View**: Browse locations in a sortable, filterable table format
- 🔍 **Smart Search**: Search by location name, neighborhood, or key phrases from reviews
- 🤖 **TF-IDF Analysis**: Automatically extract significant phrases from Google Reviews using Term Frequency-Inverse Document Frequency algorithm
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🚀 **GitHub Pages Deployment**: Automatically deployed via GitHub Actions

## 🎯 Live Demo

Visit the live dashboard: [Harold's Chicken Dashboard](https://umatt1.github.io/Harold-chicken-dashboard/)

## 🤖 Bot Scraping - Google Reviews Data Collection

The dashboard uses automated scraping via the **Google Places API** to collect real review data for all Harold's Chicken locations. This is handled by the `fetch-reviews.js` script.

### How the Scraper Works

1. **Location Discovery**: The bot searches for "Harold's Chicken Chicago" using Google's Text Search API, automatically paginating through all results to find every location.

2. **Place Details Retrieval**: For each discovered location, the script fetches detailed information including:
   - Name and address
   - Geographic coordinates (lat/lng)
   - Overall rating and total review count
   - Up to 5 recent reviews per location (Google API limit)

3. **Neighborhood Mapping**: Addresses are automatically mapped to Chicago neighborhoods using ZIP code lookups (e.g., 60619 → Chatham, 60615 → Hyde Park).

4. **Data Export**: All collected data is saved to `data.json`, which the static site reads to populate the dashboard.

### Running the Scraper

```bash
# Install dependencies
npm install

# Set up your Google Places API key
cp .env.example .env
# Edit .env and add your GOOGLE_PLACES_API_KEY

# Run the scraper
node fetch-reviews.js
```

### API Requirements

- **Google Places API Key**: Required for fetching location and review data
- **Enabled APIs**: Places API, Maps JavaScript API
- **Rate Limits**: The script includes built-in delays to respect Google's rate limits

### Data Structure

The scraper outputs JSON with the following structure for each location:

```json
{
  "name": "Harold's Chicken Shack #55",
  "address": "123 E 87th St, Chicago, IL 60619",
  "neighborhood": "Chatham",
  "placeId": "ChIJ...",
  "lat": 41.7358,
  "lng": -87.6056,
  "rating": 4.2,
  "reviewCount": 245,
  "reviews": [
    {
      "author": "John D.",
      "rating": 5,
      "text": "Best chicken in the city!",
      "time": "2 months ago"
    }
  ]
}
```

## 🏗️ Technical Architecture

### Components

| File | Description |
|------|-------------|
| `index.html` | Main HTML structure and layout |
| `styles.css` | Responsive CSS styling with modern design |
| `app.js` | Main application logic, UI interactions, and data visualization |
| `fetch-reviews.js` | **Google Places API scraper** - collects real review data |
| `scraper.js` | Client-side data handler (loads from data.json) |
| `tfidf.js` | TF-IDF algorithm implementation for phrase extraction |
| `data.json` | Scraped location and review data |
| `.github/workflows/` | GitHub Actions for automatic deployment |

### Technologies Used

- **Leaflet.js**: Interactive mapping library
- **Vanilla JavaScript**: No framework dependencies for fast loading
- **CSS3**: Modern styling with gradients, animations, and flexbox
- **Node.js + Axios**: Server-side scraping with Google Places API
- **GitHub Actions**: CI/CD for automatic deployment to GitHub Pages

## 🔬 TF-IDF Algorithm

The dashboard uses a custom TF-IDF (Term Frequency-Inverse Document Frequency) implementation to extract significant phrases from reviews:

- **TF (Term Frequency)**: Measures how frequently a term appears in a document (normalized by document length)
- **IDF (Inverse Document Frequency)**: Measures how unique/significant a term is across all documents (higher for rare terms)
- **TF-IDF Score**: TF × IDF = Combines frequency with uniqueness to identify the most significant terms

### How It Identifies Significant Phrases

The algorithm works by comparing word frequency within a single location's reviews against frequency across ALL locations:

```
Significance = (Word frequency at this location) / (Word frequency across all locations)
```

This surfaces phrases that are **uniquely characteristic** of each location - not just common words like "chicken" or "good", but specific mentions like "mild sauce", "gizzards", or "drive-thru speed" that distinguish one Harold's from another.

## 🚀 Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/umatt1/Harold-chicken-dashboard.git
cd Harold-chicken-dashboard
```

2. Install dependencies (for scraping):
```bash
npm install
```

3. Open `index.html` in a web browser:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Or simply open index.html directly in your browser
```

4. Visit `http://localhost:8000` in your browser

### Refreshing Review Data

To update the dashboard with fresh review data:

1. Ensure your `.env` file has a valid `GOOGLE_PLACES_API_KEY`
2. Run `node fetch-reviews.js`
3. Commit and push the updated `data.json`
4. GitHub Actions will automatically redeploy

### Deployment to GitHub Pages

The dashboard automatically deploys to GitHub Pages via GitHub Actions when you push to the main branch.

1. Ensure GitHub Pages is enabled in your repository settings
2. Set the source to "GitHub Actions"
3. Push your changes to the main branch
4. The workflow will automatically build and deploy

## 🎨 Customization

### Modifying the TF-IDF Algorithm

The algorithm can be tuned in `tfidf.js`:
- Adjust `stopWords` to filter more/fewer common words
- Change `topN` parameter to extract more/fewer phrases
- Modify n-gram size for different phrase lengths

### Styling

All visual styling is in `styles.css`. Key customizable elements:
- Color scheme (gradients, accent colors)
- Typography
- Spacing and layout
- Responsive breakpoints

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Harold's Chicken Shack for being a Chicago institution
- OpenStreetMap for map tiles
- Leaflet.js for the mapping library
- Google Places API for location and review data
- The Chicago community for their reviews and support

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

Made with ❤️ for Chicago's best chicken