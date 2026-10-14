# 🇩🇰 DR TV Denmark - Stremio v4 Addon

A local, standalone **Stremio v4 Addon** that scrapes catalog items and streams content directly from **DR TV (Danmarks Radio)**, including live channels (DR1, DR2, DR Ramasjang) and on-demand programs with DR account authentication.

---

## 📺 Features

- **Live TV Channels**: Direkte streaming for **DR1**, **DR2**, and **DR Ramasjang** via authorized Akamai HLS Master streams (`.m3u8`).
- **On-Demand Catalogs**: "Populære" and "Nyeste" catalogs dynamically mapped to DR TV's internal OTT backend (`isl.dr-massive.com` / `production-cdn.dr-massive.com`).
- **DR TV Account Authentication**: Support for optional `DR_EMAIL` and `DR_PASSWORD` credentials to unlock personalized streams and avoid guest quotas.
- **Session Caching**: Automatic disk persistence of authentication tokens (`.session_cache.json`) with proactive token expiration handling to prevent redundant logins.
- **Failover & Resiliency**: Built-in fallback stream URLs and curated backup catalogues ensuring uninterrupted playback even if upstream endpoints throttle or adjust rate limits.

---

## 📁 Project Structure

```text
.
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules for node_modules, logs, and session cache
├── package.json              # Project dependencies and startup scripts
├── server.js                 # Primary Stremio Addon server and handler definitions
├── index.js                  # Entrypoint proxy
├── src/
│   ├── auth.js               # DR TV Account login, anonymous SSO, and token cache manager
│   ├── channels.js           # Static definitions and HLS streams for DR Live TV channels
│   └── drtvService.js        # Catalog parser, meta resolvers, and HLS stream builders
└── README.md                 # Setup and usage guide
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Stremio Desktop App](https://www.stremio.com/)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Credentials (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` if you wish to provide your DR account credentials:
```env
PORT=7000
DR_EMAIL=your-email@example.com
DR_PASSWORD=your-secure-password
SESSION_STORAGE_PATH=./.session_cache.json
```
*(If no credentials are provided, the addon automatically falls back to DR's Anonymous SSO session protocol and public Akamai feeds).*

### 4. Run the Addon
```bash
node server.js
# Or using npm:
npm start
```

You should see:
```text
======================================================
🇩🇰 DR TV Denmark Stremio Addon active on port 7000
Manifest URL: http://127.0.0.1:7000/manifest.json
Load this URL into Stremio: Settings -> Addons -> Add Addon
======================================================
```

---

## 🔌 Installing into Stremio

1. Open the **Stremio** desktop application.
2. Click on the puzzle piece icon (**Add-ons**) on the top right.
3. In the search box or the input field for custom addons, paste the manifest URL:
   ```text
   http://127.0.0.1:7000/manifest.json
   ```
4. Click **Install**.
5. Navigate to **Discover** → select **TV Channels** or **Series** to browse **DR TV Denmark**!

---

## 🌍 Geoblocking Note
DR TV streams are geo-restricted to Denmark by Danmarks Radio. If you are accessing streams from outside Denmark, ensure your machine or home network uses a Danish IP address / VPN connection.
