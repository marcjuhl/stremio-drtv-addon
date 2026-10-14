# 🇩🇰 DR TV Denmark - Stremio Addon

[![CI](https://github.com/marcjuhl/stremio-drtv-addon/actions/workflows/ci.yml/badge.svg)](https://github.com/marcjuhl/stremio-drtv-addon/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A free, customizable **Stremio v4 Addon** that provides live streaming and on-demand content from **DR TV (Danmarks Radio)**. Includes an interactive web configurator so users can personalize catalogs, channels, and optional credentials directly from their browser.

---

## 🌐 Live GitHub Pages Addon (Zero Hosting Setup Required)

This addon is live on **GitHub Pages**:

- **Web Landing & 1-Click Install**: [https://marcjuhl.github.io/stremio-drtv-addon/](https://marcjuhl.github.io/stremio-drtv-addon/)
- **Direct Manifest URL**:
  ```text
  https://marcjuhl.github.io/stremio-drtv-addon/manifest.json
  ```

*(Includes 1080p live streams with backup Akamai feeds for DR1, DR2, and DR Ramasjang. 100% serverless, zero maintenance).*

---

## ⚡ Full VOD & Authentication Cloud Hosting (Node.js)

Because Stremio requires dynamic HTTP/HTTPS stream resolving and API proxying, you can host your own free 24/7 instance in less than 60 seconds on any free cloud host:

| Provider | Deployment Type | Free Tier | Setup Link |
| :--- | :--- | :--- | :--- |
| **Koyeb** | Docker / Node.js | Free 24/7 web service | [Deploy to Koyeb](https://app.koyeb.com/) |
| **Render** | Web Service | Free tier available | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/marcjuhl/stremio-drtv-addon) |
| **Railway** | Docker / Node.js | Free trial / credits | [Deploy on Railway](https://railway.app/new) |
| **Hugging Face Spaces** | Docker Space | 100% Free 24/7 | [Create Docker Space](https://huggingface.co/spaces) |

Once deployed, your addon will be live at:
```text
https://your-app-name.koyeb.app/configure
```

---

## 🎨 Interactive Web Configurator

When users navigate to your deployed addon URL (or `http://localhost:7000/configure`), they get an interactive configuration interface allowing them to:

1. **Toggle Catalogs**: Enable/disable Live TV, Populære, or Nyeste catalogs.
2. **Set DR TV Credentials (Optional)**: Input personal `DR_EMAIL` and `DR_PASSWORD` to stream age-restricted or personalized content.
3. **1-Click Stremio Install**: Click the **"Install Addon in Stremio"** button to register their custom manifest via `stremio://` protocol.

---

## 📁 Project Structure

```text
.
├── .env.example              # Environment variables template
├── .github/workflows/ci.yml  # Automated GitHub Actions test workflow
├── Dockerfile                # Multi-stage container for 1-click cloud hosting
├── server.js                 # Express server + dynamic Stremio Addon router
├── index.js                  # App entry point
├── package.json              # Project dependencies and startup scripts
├── public/
│   └── configure.html        # Interactive web configurator UI
├── src/
│   ├── auth.js               # DR TV login, Anonymous SSO, and session token caching
│   ├── channels.js           # Verified Akamai HLS streams for DR live channels (DR1, DR2, Ramasjang)
│   └── drtvService.js        # Catalog parser, meta resolvers, and HLS stream builders
└── README.md
```

---

## 💻 Local Development

### 1. Clone & Install
```bash
git clone https://github.com/marcjuhl/stremio-drtv-addon.git
cd stremio-drtv-addon
npm install
```

### 2. Run
```bash
node server.js
```

Open [http://localhost:7000/configure](http://localhost:7000/configure) in your browser to configure and test!

---

## 🌍 Geoblocking Note
Content streams from DR TV are geo-restricted to Denmark. When deploying to a cloud host (Render, Koyeb, etc.) or streaming locally, ensure traffic originates from a Danish IP or VPN.
