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

## 🏗️ Technical Architecture

### Components

1. **index.html**: Main HTML structure and layout
2. **styles.css**: Responsive CSS styling with modern design
3. **app.js**: Main application logic, UI interactions, and data visualization
4. **scraper.js**: Google Reviews scraper (simulated with sample data)
5. **tfidf.js**: TF-IDF algorithm implementation for phrase extraction
6. **deploy.yml**: GitHub Actions workflow for automatic deployment

### Technologies Used

- **Leaflet.js**: Interactive mapping library
- **Vanilla JavaScript**: No framework dependencies for fast loading
- **CSS3**: Modern styling with gradients, animations, and flexbox
- **GitHub Actions**: CI/CD for automatic deployment to GitHub Pages

## 🔬 TF-IDF Algorithm

The dashboard uses a custom TF-IDF (Term Frequency-Inverse Document Frequency) implementation to extract significant phrases from reviews:

- **TF (Term Frequency)**: Measures how frequently a term appears in a document (normalized by document length)
- **IDF (Inverse Document Frequency)**: Measures how unique/significant a term is across all documents (higher for rare terms)
- **TF-IDF Score**: TF × IDF = Combines frequency with uniqueness to identify the most significant terms

This algorithm identifies the most meaningful phrases that distinguish each location's reviews, filtering out common words and highlighting unique characteristics mentioned by reviewers.

## 📊 Data Structure

Each location includes:
- Name and address
- Geographic coordinates (latitude/longitude)
- Neighborhood classification
- Quality rating (1-5 stars)
- Review count
- Sample reviews
- Extracted key phrases (via TF-IDF)

## 🚀 Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/umatt1/Harold-chicken-dashboard.git
cd Harold-chicken-dashboard
```

2. Open `index.html` in a web browser:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Or simply open index.html directly in your browser
```

3. Visit `http://localhost:8000` in your browser

### Deployment to GitHub Pages

The dashboard automatically deploys to GitHub Pages via GitHub Actions when you push to the main branch.

1. Ensure GitHub Pages is enabled in your repository settings
2. Set the source to "GitHub Actions"
3. Push your changes to the main branch
4. The workflow will automatically build and deploy

## 🎨 Customization

### Adding More Locations

Edit `scraper.js` and add locations to the `this.locations` array:

```javascript
{
    name: "Harold's Chicken Shack #11",
    address: "Your Address Here",
    neighborhood: "Neighborhood Name",
    lat: 41.xxxx,
    lng: -87.xxxx,
    rating: 4.x,
    reviewCount: xxx
}
```

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
- The Chicago community for their reviews and support

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

Made with ❤️ for Chicago's best chicken