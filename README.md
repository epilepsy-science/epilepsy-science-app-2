# EPILEPSY.SCIENCE WEB APPLICATION
This is the repository for the Epilepsy.Science Web Application. The application is build using [Nuxt.js](https://nuxtjs.org) and [Vue.js](https://vuejs.org/).

# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

1. Make sure to install the dependencies:

```bash
yarn install
```

2. Make sure to set any un-set environment variables found in the nuxt.config file

## Environment Variables

The following environment variables are required to run locally. Values can be obtained once you are given access to epilepsy.science developer apps on Heroku.

| Variable | Description |
|---|---|
| `ALGOLIA_API_KEY` | Algolia search API key |
| `ALGOLIA_APP_ID` | Algolia application ID |
| `ALGOLIA_INDEX` | Algolia search index name |
| `CTF_SPACE_ID` | Contentful space ID |
| `CTF_CDA_ACCESS_TOKEN` | Contentful Content Delivery API token |
| `CTF_API_HOST` | Contentful API host |
| `DEPLOY_ENV` | Environment identifier |
| `PORTAL_API_HOST` | Portal API endpoint |

Create a file called `env_var.sh` in the project root with your values:

```bash
export ALGOLIA_API_KEY=your_key
export ALGOLIA_APP_ID=your_app_id
export ALGOLIA_INDEX=your_index
export CTF_SPACE_ID=your_space_id
export CTF_CDA_ACCESS_TOKEN=your_token
export CTF_API_HOST=your_host
export DEPLOY_ENV=your_env
export PORTAL_API_HOST=your_host
```

This file is not tracked by git. The `dev` script will source it automatically.
## Development Server

Start the development server on `http://localhost:3000`:


```bash
# yarn
yarn dev
```

## Production

Build the application for production:

```bash
# yarn
yarn build
```

Locally preview production build:

```bash
# yarn
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
