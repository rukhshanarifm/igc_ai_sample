# Repository Structure

This is a single unified Git repository for the IGC AI Intelligence Dashboard project.

## Directory Structure

```
igc_ai_sample/                    # Root repository
├── .git/                         # Single git repository (this is the only .git)
├── .gitignore                    # Root gitignore (includes Node.js and Python)
├── netlify.toml                  # Netlify deployment config (at root)
├── vercel.json                   # Vercel deployment config
├── README.md                     # Main documentation
├── DEPLOYMENT.md                 # Deployment instructions
│
├── data/                         # Data storage
│   ├── postprocessed/           # Processed article data (committed)
│   ├── raw/                     # Raw data (gitignored)
│   └── preprocessed/            # Intermediate data (gitignored)
│
├── scripts/                      # Data processing scripts
│   ├── build-data.sh            # Main build script
│   ├── pre-deploy-check.sh      # Deployment validation
│   ├── process_articles.py      # Article processor
│   └── requirements.txt         # Python dependencies
│
└── insight-hub/                  # React dashboard application
    ├── .gitignore               # Local ignores (node_modules, dist, etc.)
    ├── package.json             # Node dependencies
    ├── vite.config.ts           # Vite build config
    ├── public/
    │   ├── _redirects           # SPA routing for deployment
    │   └── data/                # Generated JSON data (committed)
    │       ├── articles.json
    │       ├── kpis.json
    │       ├── trends.json
    │       └── insights.json
    └── src/                     # React application source
        ├── components/
        ├── pages/
        ├── services/
        └── types/
```

## Key Points

### ✅ Single Repository
- **One `.git` folder** at the root level
- No nested git repositories
- All code tracked together

### ✅ Deployment Configuration
- `netlify.toml` at repository root with `base = "insight-hub"`
- `vercel.json` at repository root
- GitHub Actions workflow in `.github/workflows/`

### ✅ What's Committed
- All source code
- Configuration files
- Processed data files (`data/postprocessed/`, `insight-hub/public/data/`)
- Build scripts
- Documentation

### ✅ What's Ignored
- `node_modules/` - Node.js dependencies
- `dist/` - Build output
- `data/raw/` - Raw scraped data
- `__pycache__/` - Python cache
- `.env` files - Environment variables

## Deployment

### Netlify
The `netlify.toml` tells Netlify to:
1. Use `insight-hub` as the base directory
2. Run `npm run build` to build
3. Deploy the `dist/` folder

### Vercel
The `vercel.json` configures similar settings for Vercel.

### GitHub Pages
The `.github/workflows/deploy.yml` handles automated deployment.

## Development Workflow

1. **Process data**:
   ```bash
   cd scripts
   bash build-data.sh
   ```

2. **Develop dashboard**:
   ```bash
   cd insight-hub
   npm install
   npm run dev
   ```

3. **Commit changes**:
   ```bash
   cd ..  # Back to root
   git add .
   git commit -m "Your message"
   git push
   ```

4. **Deploy**:
   - Push to main branch (auto-deploys)
   - Or use: `netlify deploy --prod`

## Migration Notes

This repository was consolidated from a nested structure where `insight-hub` was a separate git repository. It's now a single unified repository with proper deployment configuration at the root level.
