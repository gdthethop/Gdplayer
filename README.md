# GdPlayer Frontend

> **Version:** 1.3.2  
> **Status:** Production Ready (PWA Enabled)

## 🎯 Main Goal

**GdPlayer** aims to deliver a premium, "Netflix-meets-YouTube" viewing experience. We bridge the gap between aesthetic appeal and functional power, providing users with a sleek, dark-mode cinema interface for discovering, watching, and uploading high-quality video content.

## ✨ Key Features

### 🖥️ Immersive User Interface
- **Premium Design:** Glassmorphism effects, smooth micro-interactions, and a cohesive dark theme.
- **Responsive Layout:** Optimized for 4K desktops, laptops, tablets, and mobile devices.
- **Custom Video Player:** A bespoke player with custom controls, scrubbing, and overlay UI (not just the default browser player).

### 🎬 Creator Studio & Uploads
- **Drag & Drop Uploads:** Intuitive upload zone with progress visualization.
- **Video Management:** Edit metadata, privacy settings, and playlists.
- **Creator Dashboard:** Analytics and content management tools.

### 👤 User Experience
- **Smart Recommendations:** Algorithms to suggest content based on viewing history.
- **Social Interaction:** Like, comment, and subscribe to creators.
- **Library Management:** Watch Later, History, and Custom Playlists.
- **Profile Customization:** Avatar uploads and account settings.

## 🛠️ Tech Stack

- **Core:** React 19
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **Styling:** Material-UI (MUI) v6 + Custom CSS
- **Network:** Axios with robust interceptors (Auto-logout on 401)

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env` file:
   ```env
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   ```

3. **Start Local Development:**
   ```bash
   npm start
   ```

4. **Deploy:**
   Builds are optimized for GitHub Pages or static serving.
   ```bash
   npm run deploy
   ```

## 📅 Version History

- **v1.3.2**: 
  - **PWA Integration**: Full Progressive Web App support. Now installable on all devices with offline manifests and premium splash screens.
  - **Professional Player UI**: Overhauled mobile player with floating "glass" controls, 10s Skip Forward/Backward actions, and a high-precision edge-to-edge seek bar.
  - **Identity & Branding**: Re-integrated the GdPlayer logo into the center action overlay with enhanced visibility and smooth animations.
  - **Header Optimization**: Refined mobile header with backdrop blur and professional pill-shaped Authentication buttons.
  - **Infrastructure**: Fully migrated to high-performance Vercel backend infrastructure.

- **v1.3.1**: 
  - **Comment System Overhaul**: Fixed critial bugs in comment fetching (ID vs shortCode resolution) and frontend rendering.
  - **UI Polish**: Refined Hero Section dimensions to align with Golden Ratio principles.
  - **Bug Fixes**: Resolved "User profile error" by patching auth responses to include robust ID data.

- **v1.3.0** (Previous):
  - Added "Back to Home" navigation in Upload flow.
  - Fixed S3 CORS integration for production.
  - Enhanced Authentication flows (Forgot Password, 2FA).
  - Production deployment configurations.

- **v1.2.0**: Initial Release of Creator Studio.
- **v1.0.0**: Alpha launch.

---
*Built with ❤️ by the GdPlayer Team*
