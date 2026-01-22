# IGC AI Sample - Intelligence Dashboard

An AI-powered intelligence dashboard for analyzing news articles, tracking KPIs, and providing actionable insights for the Prime Minister's Office, Pakistan.

## 🌟 Features

- **Real-time Article Analysis**: AI-summarized news from multiple sources
- **Sentiment Analysis**: Track sentiment trends across articles
- **KPI Monitoring**: Monitor key performance indicators with historical trends
- **AI-Generated Insights**: Automated analysis and recommendations
- **Alert System**: Real-time alerts for critical issues
- **Interactive Visualizations**: Charts and graphs for data visualization
- **Article Bookmarking**: Save articles for later reading
- **Export Functionality**: Export data in multiple formats (PDF, Excel, JSON)

## 🚀 Quick Start

### Prerequisites

- **Bun** (recommended) or **Node.js 20+**
- Python 3.8+ (for data processing)
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd igc_ai_sample

# Install Python dependencies
cd scripts
pip install -r requirements.txt

# Build data files
bash build-data.sh

# Install Node dependencies and start development server
cd ../insight-hub
bun install
bun run dev
```

The dashboard will be available at `http://localhost:8080`

## 📁 Project Structure

```
igc_ai_sample/
├── data/                    # Data storage
│   ├── postprocessed/      # Processed article data
│   └── raw/                # Raw scraped data
├── insight-hub/            # React dashboard application
│   ├── public/
│   │   └── data/          # Generated JSON data files
│   └── src/
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── services/      # Data services
│       └── types/         # TypeScript types
└── scripts/               # Data processing scripts
    ├── build-data.sh      # Data build script
    └── process_articles.py # Article processing
```

## 🔧 Development

### Running the Dashboard

```bash
cd insight-hub
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Lint code
bun run test         # Run tests
```

### Processing Data

```bash
cd scripts
bash build-data.sh   # Process all data and generate JSON files
```

This script:
1. Processes raw article data from CSV files
2. Generates sentiment analysis
3. Creates KPI metrics
4. Builds trend data
5. Generates AI insights and alerts
6. Outputs JSON files to `insight-hub/public/data/`

## 🌐 Deployment

This project is ready to deploy to multiple platforms. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Options

#### Netlify (Recommended)

```bash
cd insight-hub
netlify deploy --prod
```

#### GitHub Pages

Push to `main` branch - automatic deployment via GitHub Actions is configured.

#### Vercel

```bash
vercel
```

### Deployment Files

- ✅ `netlify.toml` - Netlify configuration
- ✅ `vercel.json` - Vercel configuration
- ✅ `.github/workflows/deploy.yml` - GitHub Actions workflow
- ✅ `public/_redirects` - SPA routing configuration

## 📊 Data Sources

The dashboard processes articles from:
- Business Recorder (brecorder)
- Dawn News

Categories:
- Power & Energy
- Tax & Revenue
- Economics
- Policy

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching

### Data Processing
- **Python 3** - Data processing
- **Pandas** - Data manipulation
- **Transformers** - AI/NLP models
- **NLTK** - Natural language processing

## 📈 Performance Optimizations

- Code splitting for faster initial load
- Lazy loading of components
- Optimized chunk sizes
- Asset caching (31 days for static assets)
- Data file caching (1 hour)
- Image optimization
- Pagination for large article lists

## 🔒 Security Features

- Content Security Policy headers
- XSS protection
- Frame protection (X-Frame-Options)
- HTTPS enforcement (on deployment)
- Secure referrer policy

## 📝 Environment Variables

No environment variables are required for basic operation. The application uses static JSON data files.

For custom configurations:
- Create `.env.local` in `insight-hub/` directory
- Add your custom variables

## 🧪 Testing

```bash
cd insight-hub
bun run test         # Run tests once
bun run test:watch   # Run tests in watch mode
```

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [Component Documentation](./insight-hub/src/components/README.md) - Component usage
- [Data Processing](./scripts/README.md) - Data pipeline details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software for the Prime Minister's Office, Pakistan.

## 🆘 Troubleshooting

### Dashboard loads slowly
- Check article count in `public/data/articles.json` (should be < 1000)
- Clear browser cache
- Run `bun run build` for optimized production build

### No data showing
- Ensure data files are generated: `cd scripts && bash build-data.sh`
- Check browser console for errors
- Verify JSON files exist in `insight-hub/public/data/`

### Build fails
- Clear node_modules: `rm -rf node_modules bun.lockb && bun install`
- Ensure Bun version is latest: `bun upgrade`
- Check TypeScript errors: `bun run lint`

### Deployment fails
- Check build logs for errors
- Verify data files are committed to git
- Ensure build command is correct for your platform
- Check netlify.toml or vercel.json configuration

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review deployment documentation
- Check application logs in browser console

---

Built with ❤️ for the Prime Minister's Office, Pakistan
