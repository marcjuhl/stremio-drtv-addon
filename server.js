import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import express from 'express';
import pkg from 'stremio-addon-sdk';
const { addonBuilder, getRouter } = pkg;

import { DRAuthManager } from './src/auth.js';
import { DRTVService } from './src/drtvService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7000;

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Serve Configuration page
const configureHtmlPath = path.join(__dirname, 'public', 'configure.html');
app.get(['/', '/configure'], (req, res) => {
  if (fs.existsSync(configureHtmlPath)) {
    res.sendFile(configureHtmlPath);
  } else {
    res.send('<h2>DR TV Stremio Addon Configurator</h2>');
  }
});

// Helper to decode user configuration from path
function parseUserConfig(configParam) {
  if (!configParam) return {};
  try {
    const decoded = Buffer.from(configParam, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (e) {
    try {
      return JSON.parse(decodeURIComponent(configParam));
    } catch {
      return {};
    }
  }
}

// Generate Addon Builder instance with optional custom user configuration
function createAddon(userConfig = {}) {
  const email = userConfig.email || process.env.DR_EMAIL;
  const password = userConfig.password || process.env.DR_PASSWORD;
  const catalogsConfig = userConfig.catalogs || { live: true, popular: true, newest: true };

  const authManager = new DRAuthManager({ email, password });
  const drtvService = new DRTVService(authManager);

  // Dynamic catalogs based on configuration
  const catalogs = [];
  if (catalogsConfig.live !== false) {
    catalogs.push({
      type: 'tv',
      id: 'dr_live',
      name: 'DR TV - Live TV',
      extra: [{ name: 'search', isRequired: false }]
    });
  }
  if (catalogsConfig.popular !== false) {
    catalogs.push({
      type: 'series',
      id: 'dr_popular',
      name: 'DR TV - Populære',
      extra: [{ name: 'search', isRequired: false }]
    });
  }
  if (catalogsConfig.newest !== false) {
    catalogs.push({
      type: 'series',
      id: 'dr_newest',
      name: 'DR TV - Nyeste',
      extra: [{ name: 'search', isRequired: false }]
    });
  }

  const manifest = {
    id: 'org.stremio.drdk',
    name: 'DR TV Denmark',
    version: '1.0.0',
    description: 'Direkte TV og on-demand udsendelser fra Danmarks Radio (DR TV). Inkluderer DR1, DR2, Ramasjang og populære serier.',
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie', 'series', 'tv'],
    idPrefixes: ['dr_'],
    catalogs,
    behaviorHints: {
      configurable: true,
      configurationRequired: false
    },
    background: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1920&q=80',
    logo: 'https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=%2Fimages%2Fother%2F2020%2F01%2F09%2Fdr1_logo_rgb.png&scaleAfter=crop&width=300&height=300'
  };

  const builder = new addonBuilder(manifest);

  builder.defineCatalogHandler(async ({ type, id, extra }) => {
    try {
      const metas = await drtvService.getCatalogItems(type, id, extra);
      return { metas };
    } catch (err) {
      console.error(`[Catalog] Error (${id}):`, err.message);
      return { metas: [] };
    }
  });

  builder.defineMetaHandler(async ({ type, id }) => {
    try {
      const meta = await drtvService.getMeta(type, id);
      return { meta };
    } catch (err) {
      console.error(`[Meta] Error (${id}):`, err.message);
      return { meta: null };
    }
  });

  builder.defineStreamHandler(async ({ type, id }) => {
    try {
      const streams = await drtvService.getStreams(type, id);
      return { streams };
    } catch (err) {
      console.error(`[Stream] Error (${id}):`, err.message);
      return { streams: [] };
    }
  });

  return builder.getInterface();
}

// 1. Default addon router (unconfigured)
const defaultAddon = createAddon();
app.use(getRouter(defaultAddon));

// 2. Dynamic parameterized router for personalized user configurations (/:configuration/manifest.json, etc.)
app.use('/:configuration', (req, res, next) => {
  // If the path is for configure page or static files, skip
  if (req.params.configuration === 'configure' || req.params.configuration.includes('.')) {
    return next();
  }
  const config = parseUserConfig(req.params.configuration);
  const userAddon = createAddon(config);
  const router = getRouter(userAddon);
  return router(req, res, next);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🇩🇰 DR TV Denmark Stremio Addon active on port ${PORT}`);
  console.log(`Web Configurator: http://localhost:${PORT}/configure`);
  console.log(`Default Manifest: http://localhost:${PORT}/manifest.json`);
  console.log(`======================================================\n`);
});
