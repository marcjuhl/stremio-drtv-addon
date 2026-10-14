import 'dotenv/config';
import pkg from 'stremio-addon-sdk';
const { addonBuilder, serveHTTP } = pkg;

import { DRAuthManager } from './src/auth.js';
import { DRTVService } from './src/drtvService.js';

// Initialize Authentication Manager and Service
const authManager = new DRAuthManager();
const drtvService = new DRTVService(authManager);

// Stremio Addon Manifest Specification
const manifest = {
  id: 'org.stremio.drdk',
  name: 'DR TV Denmark',
  version: '1.0.0',
  description: 'Se direkte TV og on-demand udsendelser fra Danmarks Radio (DR TV). Inkluderer DR1, DR2, Ramasjang og populære serier.',
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'series', 'tv'],
  idPrefixes: ['dr_'],
  catalogs: [
    {
      type: 'tv',
      id: 'dr_live',
      name: 'DR TV - Live TV',
      extra: [{ name: 'search', isRequired: false }]
    },
    {
      type: 'series',
      id: 'dr_popular',
      name: 'DR TV - Populære',
      extra: [{ name: 'search', isRequired: false }]
    },
    {
      type: 'series',
      id: 'dr_newest',
      name: 'DR TV - Nyeste',
      extra: [{ name: 'search', isRequired: false }]
    }
  ],
  background: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1920&q=80',
  logo: 'https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=%2Fimages%2Fother%2F2020%2F01%2F09%2Fdr1_logo_rgb.png&scaleAfter=crop&width=300&height=300'
};

const builder = new addonBuilder(manifest);

// Catalog Handler
builder.defineCatalogHandler(async ({ type, id, extra }) => {
  console.log(`[Catalog] Request: type=${type}, id=${id}, extra=${JSON.stringify(extra || {})}`);
  try {
    const metas = await drtvService.getCatalogItems(type, id, extra);
    return { metas };
  } catch (err) {
    console.error(`[Catalog] Error handling ${id}:`, err.message);
    return { metas: [] };
  }
});

// Meta Handler
builder.defineMetaHandler(async ({ type, id }) => {
  console.log(`[Meta] Request: type=${type}, id=${id}`);
  try {
    const meta = await drtvService.getMeta(type, id);
    return { meta };
  } catch (err) {
    console.error(`[Meta] Error handling ${id}:`, err.message);
    return { meta: null };
  }
});

// Stream Handler
builder.defineStreamHandler(async ({ type, id }) => {
  console.log(`[Stream] Request: type=${type}, id=${id}`);
  try {
    const streams = await drtvService.getStreams(type, id);
    return { streams };
  } catch (err) {
    console.error(`[Stream] Error handling ${id}:`, err.message);
    return { streams: [] };
  }
});

// Start HTTP Server
const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`\n======================================================`);
console.log(`🇩🇰 DR TV Denmark Stremio Addon active on port ${PORT}`);
console.log(`Manifest URL: http://127.0.0.1:${PORT}/manifest.json`);
console.log(`Load this URL into Stremio: Settings -> Addons -> Add Addon`);
console.log(`======================================================\n`);
