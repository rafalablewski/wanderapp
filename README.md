# SkyWrapped ✈️

> Premium Travel Identity App — Dark luxury meets iOS glass morphism

A beautiful, award-worthy travel companion app inspired by the design philosophies of Uber, Apple, and Lucid Motors.

## ✨ Features

- **Trip Dashboard** — Overview of upcoming and past trips with rich detail cards
- **Smart Timeline** — Day-by-day itinerary with flights, hotels, experiences, and more
- **Real-time Alerts** — Flight delays, check-in reminders, and affected booking chains
- **Budget Tracker** — Visual spending breakdown by category
- **Weather Forecast** — 6-day forecast for your destination
- **Documents Vault** — Quick access to visas, tickets, and confirmations
- **Explore Tab** — AI-powered trip discovery and recommendations

## 🎨 Design System

### Typography (3-Font Harmony)
- **Space Grotesk** — Headlines & hero text
- **Inter** — Body copy & UI labels
- **JetBrains Mono** — Data, times, codes

### Colors
- **Gold** `#d4af37` → `#f4d03f` — Primary accent
- **Deep Space** `#0a0a0f` — Background base
- **Indigo Glow** `#6366f1` — Secondary accent

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
skywrapped-app/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles + Tailwind
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── package.json
```

## 🛠 Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Tailwind CSS** — Utility-first styling

## 📝 Development Notes

### Debug Mode
Toggle `SHOW_DEBUG_LABELS` in `App.jsx` to show/hide component debug labels:
```jsx
const SHOW_DEBUG_LABELS = true; // Set to false for production
```

---

Built with 🖤 by Rafal
