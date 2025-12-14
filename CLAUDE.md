# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Epilepsy.Science web application - a scientific data portal for epilepsy research built with Nuxt 3 and Vue.js. The application integrates with Pennsieve (data management platform), Contentful (CMS), and Algolia (search).

## Development Commands

```bash
# Install dependencies
yarn install

# Start development server (http://localhost:3000)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Start production server
yarn start

# Generate static site
yarn generate

# Generate sitemap
yarn sitemap
```

## Required Environment Variables

Set these before running locally (values from Heroku developer apps):
- `ALGOLIA_API_KEY`, `ALGOLIA_APP_ID`, `ALGOLIA_INDEX` - Search functionality
- `CTF_SPACE_ID`, `CTF_CDA_ACCESS_TOKEN`, `CTF_API_HOST` - Contentful CMS
- `DEPLOY_ENV` - Environment identifier
- `PORTAL_API_HOST` - Portal API endpoint

Add to `env_var_set.sh` and run `source env_var_set.sh`.

## Architecture

### Tech Stack
- **Framework**: Nuxt 3 with Vue.js
- **State Management**: Pinia with persisted state (`store/index.js`)
- **UI Components**: Element Plus, SPARC Design System (`sparc-design-system-components-2`)
- **Styling**: SCSS with global variables in `assets/scss/_variables.scss`
- **CMS**: Contentful for dynamic content
- **Search**: Algolia for dataset search
- **Data Platform**: Pennsieve API for dataset management

### Directory Structure
- `pages/` - Route pages using Nuxt file-based routing
- `components/` - Vue components (auto-imported, no path prefix needed)
- `composables/` - Reusable composition functions (date formatting, file handling)
- `plugins/` - Nuxt plugins for API clients (Contentful, Algolia, Axios, Pennsieve, AWS Amplify)
- `services/` - API service modules (biolucida, discover, general)
- `utils/` - Utility functions and constants
- `layouts/` - Page layouts (default layout with header/footer)
- `middleware/` - Route middleware for redirects
- `assets/` - SCSS styles, icons, images
- `public/` - Static files served at root

### Key Pages
- `/` - Home page
- `/data` - Dataset search and listing
- `/datasets/[datasetId]` - Individual dataset view with version support
- `/projects` - Research projects listing
- `/about` - About page with team and collaborator info

### API Integrations
- **Pennsieve Discover API**: Dataset discovery and file management
- **Contentful**: Page content, news, events, resources
- **Algolia**: Full-text search across datasets
- **Biolucida**: Image viewing capabilities
- **AWS Amplify**: User authentication (Cognito)

### Component Patterns
Components are auto-imported without path prefix (configured in `nuxt.config.ts`). Major component groups:
- `Dataset/` - Dataset display components (header, details, files, downloads)
- `Datasets/` - Dataset listing and filtering components
- `FacetMenu/` - Search facet filtering components
- `ViewersMetadata/` - File viewer metadata components

### State Management
Single Pinia store (`store/index.js`) manages:
- User authentication state and profile
- Dataset information and facets
- Page statistics
- Portal notifications (from Contentful)
- Footer data