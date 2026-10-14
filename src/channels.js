/**
 * DR TV Live Channels Static Definition
 * Direct, verified Akamai HLS Master streams for all DR public TV channels.
 */
export const LIVE_CHANNELS = [
  {
    id: 'dr_live_dr1',
    name: 'DR1',
    description: 'DR1 er Danmarks førende nyheds- og aktualitetskanal, samt samlingspunkt for store begivenheder og underholdning.',
    logo: 'https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=%2Fimages%2Fother%2F2020%2F01%2F09%2Fdr1_logo_rgb.png&scaleAfter=crop&width=600&height=600',
    background: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1280&q=80',
    type: 'tv',
    streamUrl: 'https://drlivedr1hls.akamaized.net/hls/live/2113625/drlivedr1/master.m3u8',
    fallbackStreamUrl: 'https://drlive01texthls.akamaized.net/hls/live/2014186/drlive01text/master.m3u8',
    channelSlug: 'dr1'
  },
  {
    id: 'dr_live_dr2',
    name: 'DR2',
    description: 'DR2 er Danmarks samfundskanal med dybdegående journalistik, debatter, dokumentarer og satire.',
    logo: 'https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=%2Fimages%2Fother%2F2020%2F01%2F09%2Fdr2_logo_rgb.png&scaleAfter=crop&width=600&height=600',
    background: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1280&q=80',
    type: 'tv',
    streamUrl: 'https://drlivedr2hls.akamaized.net/hls/live/2113627/drlivedr2/master.m3u8',
    fallbackStreamUrl: 'https://drlive02texthls.akamaized.net/hls/live/2014188/drlive02text/master.m3u8',
    channelSlug: 'dr2'
  },
  {
    id: 'dr_live_ramasjang',
    name: 'DR Ramasjang',
    description: 'DR Ramasjang er DRs børneunivers for de 3-8 årige fyldt med leg, sjov, fantasi og musik.',
    logo: 'https://asset.dr.dk/imagescaler/?protocol=https&server=www.dr.dk&file=%2Fimages%2Fother%2F2020%2F01%2F09%2Framasjang_logo_rgb.png&scaleAfter=crop&width=600&height=600',
    background: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1280&q=80',
    type: 'tv',
    streamUrl: 'https://drliveramasjanghls.akamaized.net/hls/live/2113629/drliveramasjang/master.m3u8',
    fallbackStreamUrl: 'https://drliveramasjangtexthls.akamaized.net/hls/live/2014190/drliveramasjangtext/master.m3u8',
    channelSlug: 'ramasjang'
  }
];
