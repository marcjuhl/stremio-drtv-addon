import axios from 'axios';
import { LIVE_CHANNELS } from './channels.js';

/**
 * Service to interface with DR TV (Massive Interactive API) and Akamai streaming manifests.
 */
export class DRTVService {
  constructor(authManager) {
    this.authManager = authManager;
    this.apiBase = 'https://isl.dr-massive.com/api';
    this.cdnApiBase = 'https://production-cdn.dr-massive.com/api';
  }

  /**
   * Resolve an image scaler URL from DR TV
   */
  formatThumbnail(imageUrl, width = 640) {
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=${encodeURIComponent(imageUrl)}&scaleAfter=crop&width=${width}`;
  }

  /**
   * Fetch Catalog items for Live TV, Popular, and Newest
   */
  async getCatalogItems(type, id, extra = {}) {
    // 1. Live TV Catalog
    if (id === 'dr_live' || type === 'tv') {
      return LIVE_CHANNELS.map(ch => ({
        id: ch.id,
        type: 'tv',
        name: ch.name,
        poster: ch.logo,
        posterShape: 'square',
        banner: ch.background,
        description: ch.description,
        genres: ['Live TV', 'Nyheder', 'Public Service']
      }));
    }

    // 2. VOD / On-Demand Catalogs (Popular & Newest)
    const pagePath = id === 'dr_newest' ? '/tema/nyeste' : '/forside';
    try {
      const headers = await this.authManager.getAuthHeaders();
      const res = await axios.get(`${this.apiBase}/page`, {
        params: {
          device: 'web_browser',
          item_detail_expand: 'all',
          lang: 'da',
          max_list_prefetch: 3,
          path: pagePath
        },
        headers,
        timeout: 8000
      });

      const items = [];
      const entries = res.data?.item?.lists || res.data?.lists || [];

      for (const list of entries) {
        if (Array.isArray(list.items)) {
          for (const it of list.items) {
            const isMovie = it.type === 'movie' || it.itemType === 'movie';
            const isSeries = it.type === 'show' || it.type === 'series' || it.type === 'season';
            const stremioType = isMovie ? 'movie' : 'series';

            // Filter by requested catalog type if necessary
            if (type && type !== stremioType && type !== 'movie' && type !== 'series') {
              continue;
            }

            const poster = it.images?.portrait || it.images?.tile || it.images?.primary;
            const banner = it.images?.wallpaper || it.images?.landscape;

            items.push({
              id: `dr_${it.id}`,
              type: stremioType,
              name: it.title || it.headline,
              poster: this.formatThumbnail(poster, 400),
              banner: this.formatThumbnail(banner, 1280),
              description: it.shortDescription || it.description || it.synopsis,
              releaseInfo: it.releaseYear ? `${it.releaseYear}` : undefined,
              genres: it.genres || ['DR TV']
            });
          }
        }
      }

      // If search query is present
      if (extra && extra.search) {
        const query = extra.search.toLowerCase();
        return items.filter(i => i.name.toLowerCase().includes(query));
      }

      return items.slice(0, 50);
    } catch (err) {
      console.warn(`[DRTV Service] Catalog query error for ${id} (${err.message}). Using fallback curated items.`);
      return this.getFallbackCatalogItems(type, id);
    }
  }

  /**
   * Fallback curated items for popular Danish DR TV productions
   */
  getFallbackCatalogItems(type, catalogId) {
    const fallbackShows = [
      {
        id: 'dr_matador',
        type: 'series',
        name: 'Matador',
        poster: 'https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=%2Fimages%2Fother%2F2020%2F01%2F09%2Fdr1_logo_rgb.png&width=400',
        description: 'Den legendariske danske dramaserie om livet i Korsbæk fra 1929 til 1947 skabt af Erik Balling og Lise Nørgaard.',
        releaseInfo: '1978',
        genres: ['Drama', 'Klassiker']
      },
      {
        id: 'dr_huset',
        type: 'series',
        name: 'Huset',
        poster: 'https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=%2Fimages%2Fother%2F2020%2F01%2F09%2Fdr1_logo_rgb.png&width=400',
        description: 'Dansk spændingsdramaserie om fire fængselsbetjente i et råt og nedslidt dansk fængsel.',
        releaseInfo: '2023',
        genres: ['Drama', 'Krimi']
      },
      {
        id: 'dr_gift-ved-foerste-blik',
        type: 'series',
        name: 'Gift ved første blik',
        poster: 'https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=%2Fimages%2Fother%2F2020%2F01%2F09%2Fdr1_logo_rgb.png&width=400',
        description: 'DRs populære datingeksperiment hvor singler mødes for første gang ved alteret.',
        releaseInfo: '2024',
        genres: ['Reality', 'Underholdning']
      }
    ];

    if (catalogId === 'dr_live' || type === 'tv') {
      return LIVE_CHANNELS.map(ch => ({
        id: ch.id,
        type: 'tv',
        name: ch.name,
        poster: ch.logo,
        banner: ch.background,
        description: ch.description,
        genres: ['Live TV']
      }));
    }

    return fallbackShows;
  }

  /**
   * Fetch detailed Meta object for a given item
   */
  async getMeta(type, id) {
    // 1. Live TV Channel
    if (id.startsWith('dr_live_') || type === 'tv') {
      const channel = LIVE_CHANNELS.find(c => c.id === id);
      if (channel) {
        return {
          id: channel.id,
          type: 'tv',
          name: channel.name,
          poster: channel.logo,
          posterShape: 'square',
          background: channel.background,
          logo: channel.logo,
          description: channel.description,
          genres: ['Live TV', 'Nyheder', 'Public Service']
        };
      }
    }

    // 2. On-Demand Item Detail
    const cleanId = id.replace(/^dr_/, '');
    try {
      const headers = await this.authManager.getAuthHeaders();
      const res = await axios.get(`${this.apiBase}/items/${cleanId}`, {
        params: {
          device: 'web_browser',
          expand: 'all'
        },
        headers,
        timeout: 8000
      });

      const it = res.data;
      if (it) {
        return {
          id,
          type: it.type === 'movie' ? 'movie' : 'series',
          name: it.title || it.headline,
          poster: this.formatThumbnail(it.images?.portrait || it.images?.tile),
          background: this.formatThumbnail(it.images?.wallpaper || it.images?.landscape, 1280),
          description: it.description || it.shortDescription || it.synopsis,
          releaseInfo: it.releaseYear ? `${it.releaseYear}` : undefined,
          runtime: it.duration ? `${Math.round(it.duration / 60)} min` : undefined,
          genres: it.genres || ['DR TV']
        };
      }
    } catch (err) {
      console.warn(`[DRTV Service] Meta API fetch error for ${id} (${err.message})`);
    }

    // Fallback meta
    return {
      id,
      type: type || 'series',
      name: id.replace('dr_', '').replace(/-/g, ' ').toUpperCase(),
      description: 'DR TV Program Stream (Danmarks Radio)',
      genres: ['DR TV']
    };
  }

  /**
   * Resolve streaming HLS (.m3u8) URL for live channels and VOD items
   */
  async getStreams(type, id) {
    const streams = [];

    // 1. Live Channel Resolution
    if (id.startsWith('dr_live_') || type === 'tv') {
      const channel = LIVE_CHANNELS.find(c => c.id === id);
      if (channel) {
        // Return Primary Akamai Master HLS + High Reliability Text/Alternate Stream
        streams.push({
          name: 'DR TV Live',
          title: `${channel.name} - Direkte (1080p HLS)`,
          url: channel.streamUrl,
          behaviorHints: {
            notWebReady: false
          }
        });

        if (channel.fallbackStreamUrl) {
          streams.push({
            name: 'DR TV Live (Backup)',
            title: `${channel.name} - Backup Feed (HLS)`,
            url: channel.fallbackStreamUrl,
            behaviorHints: {
              notWebReady: false
            }
          });
        }

        return streams;
      }
    }

    // 2. VOD Stream Resolution via DR Massive Item/Videos API
    const rawId = id.replace(/^dr_/, '');
    try {
      const headers = await this.authManager.getAuthHeaders();
      const videoRes = await axios.get(`${this.apiBase}/account/items/${rawId}/videos`, {
        params: {
          delivery: 'stream',
          device: 'web_browser',
          ff: 'idp,ldp,rpt',
          resolution: 'HD-1080',
          sub: 'Anonymous'
        },
        headers,
        timeout: 9000
      });

      const videoData = videoRes.data;
      if (Array.isArray(videoData)) {
        for (const v of videoData) {
          if (v.url) {
            streams.push({
              name: 'DR TV',
              title: `DR TV (${v.quality || '1080p HLS'})`,
              url: v.url
            });
          }
        }
      } else if (videoData && videoData.url) {
        streams.push({
          name: 'DR TV',
          title: `DR TV (${videoData.quality || '1080p HLS'})`,
          url: videoData.url
        });
      }
    } catch (err) {
      console.warn(`[DRTV Service] Video resolution API note for ${id}: ${err.message}`);
    }

    // 3. Fallback resolution via DR MU Asset/BAR endpoint if available
    try {
      const muRes = await axios.get(`https://www.dr.dk/mu-online/api/1.4/bar/${rawId}`, {
        timeout: 6000
      });

      if (muRes.data?.AssetTargetUris) {
        for (const target of muRes.data.AssetTargetUris) {
          if (target.Uri && (target.Uri.includes('.m3u8') || target.Format === 'HLS')) {
            streams.push({
              name: 'DR TV (MU)',
              title: `DR TV Stream (${target.TargetQuality || 'Auto'})`,
              url: target.Uri
            });
          }
        }
      }
    } catch (muErr) {
      // Quietly ignore if MU endpoint is blocked or unsupported for this item
    }

    return streams;
  }
}
