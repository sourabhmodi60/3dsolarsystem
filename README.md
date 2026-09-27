# CosmoKids 3D: Interactive Solar System Explorer

[![Deploy CosmoKids 3D to GitHub Pages](https://github.com/actions/workflows/deploy.yml/badge.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black.svg?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite)](https://vitejs.dev/)

An interactive, educational 3D solar system exploration application designed for students, educators, and astronomy enthusiasts. Explore photorealistic celestial bodies, inspect orbital motions, listen to read-aloud voice guides, and navigate smoothly across the cosmos.

---

## 🌟 Key Features

- **Realistic 3D Celestial Bodies**:
  - High-resolution procedural textures with realistic atmospheric scattering (Earth's oceans, continents, and animated cloud layers).
  - Accurate axial tilts (e.g., Uranus's 97.8° tilt, Venus's retrograde rotation).
  - Detailed planetary rings with transparency (Saturn, Uranus).
  - Realistic cratered lunar terrain and high-albedo highlands for Earth's Moon.
  - Orbiting major natural satellites (Moon, Phobos, Deimos, Galilean moons, Titan, Triton).
  - Volumetric Asteroid Belt between Mars and Jupiter.

- **Independent Keplerian Motion**:
  - Each planet orbits around the Sun independently at its true proportional Keplerian speed (closer planets orbit faster; distant gas and ice giants glide gracefully).
  - Each planet rotates independently on its own axis at its physical rotational period.
  - Full playback speed control (0.5x, 1x, 2x, 5x, 10x) and simulation pause/resume.

- **Intelligent Camera & Area Zoom**:
  - **Cursor-Focused Zoom**: Scrolling the mouse wheel or pinching on a trackpad/touchscreen zooms directly into the specific area or planet under your cursor, rather than being locked to the Sun.
  - **Free Space Panning**: Pan the camera anywhere across the solar system by right-clicking and dragging, using middle-click, holding Shift + drag, or selecting the **Pan Focus** mode.
  - **Double-Click Navigation**: Double-click any empty region of space to center the camera on that coordinate.
  - **Center Reset**: One-click reset button to quickly return to the solar system overview.

- **Collapsible Voice Narration & Planet Profiles**:
  - Spoken audio guides for every planet and dwarf planet with karaoke word highlighting.
  - Dual-mode speech engine: Native Web Speech Synthesis with an automated fallback synthesizer for broad browser compatibility.
  - **Collapsible Modal**: Minimize the inspection card into a floating pill to inspect the 3D planet completely unobstructed while listening to facts.

- **Dynamic Space Lighting**:
  - Probe flashlight and multiple lighting modes (Bright, Balanced, Real Sun).
  - Real-time exposure and ambient lighting adjustments for optimal viewing in light or dark environments.

- **100% Client-Side & Privacy-First**:
  - Runs entirely in the web browser with zero server dependencies, zero external tracking, and zero telemetry.

---

## 🚀 Live Demo & Deployment

This project is configured to deploy directly to **GitHub Pages** as a static website using GitHub Actions.

### Setting Up GitHub Pages Deployment:
1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build and deploy the application on every push to `main` or `master`.
5. Your live app will be accessible at:
   ```
   https://<your-username>.github.io/<repository-name>/
   ```

---

## 🛠️ Local Development & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (version 9 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/cosmokids-3d.git
   cd cosmokids-3d
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
To create an optimized static production build in the `dist` folder:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

### Type Checking & Linting
```bash
npm run lint
```

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD pipeline
├── public/                     # Static public assets
├── src/
│   ├── components/
│   │   ├── MoonDetailsModal.tsx   # Detailed lunar inspector
│   │   ├── OrbitControlsHUD.tsx   # Collapsible simulation & HUD controls
│   │   ├── PlanetCardModal.tsx    # Collapsible planet inspection & voice guide
│   │   ├── PlanetSelectorBar.tsx  # Bottom quick-jump planet carousel
│   │   ├── SolarSystemCanvas.tsx  # Three.js 3D WebGL space engine
│   │   └── TopBar.tsx             # Navigation header & quick controls
│   ├── data/
│   │   └── celestialBodies.ts     # Planetary physics, stats, and facts
│   ├── types/
│   │   └── solarSystem.ts         # TypeScript definitions
│   ├── utils/
│   │   ├── audioService.ts        # UI click and sound effects
│   │   ├── speechService.ts       # Text-to-speech & fallback speech engine
│   │   └── textureGenerator.ts    # Procedural canvas-based 3D textures
│   ├── App.tsx                    # Main application component
│   └── main.tsx                   # React root entry point
├── index.html                  # HTML entry point with SEO & OpenGraph tags
├── package.json                # Project dependencies and build scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundler configuration
```

---

## 🧰 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & Voice**: Web Audio API & Web Speech Synthesis API
- **Deployment**: GitHub Pages via GitHub Actions

---

## 🔒 Privacy & Security

- **No Cookies or User Tracking**: No analytics, telemetry, or user tracking scripts are used.
- **Pure Static Execution**: Does not make network calls to third-party databases or remote backends during runtime.
- **COPPA & Student Compliant**: Designed to be safely used in classrooms and home educational environments.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
