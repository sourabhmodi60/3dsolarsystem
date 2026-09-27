import { useState, useCallback } from 'react';
import { SolarSystemCanvas } from './components/SolarSystemCanvas';
import { TopBar } from './components/TopBar';
import { OrbitControlsHUD, InteractionDragMode } from './components/OrbitControlsHUD';
import { PlanetSelectorBar } from './components/PlanetSelectorBar';
import { PlanetCardModal } from './components/PlanetCardModal';
import { MoonDetailsModal } from './components/MoonDetailsModal';
import { CelestialBody, MoonData, LightingSettings } from './types/solarSystem';
import { audioService } from './utils/audioService';
import { speechService } from './utils/speechService';

export default function App() {
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<{ moon: MoonData; parent: CelestialBody } | null>(null);

  // Orbital simulation settings
  const [isPaused, setIsPaused] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [orbitalOffset, setOrbitalOffset] = useState(0); // in degrees (0-360)
  const [dragMode, setDragMode] = useState<InteractionDragMode>('spin');

  // Planet Lighting & Visibility settings
  const [lightingSettings, setLightingSettings] = useState<LightingSettings>({
    brightness: 1.4, // bright & clear by default for kids
    lightingMode: 'bright',
    probeHeadlight: true,
  });

  // Visual toggles
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showMoons, setShowMoons] = useState(true);
  const [showAsteroids, setShowAsteroids] = useState(true);

  // Audio settings
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);

  const handleSelectBody = useCallback((body: CelestialBody) => {
    setSelectedBody(body);
    setSelectedMoon(null);
  }, []);

  const handleSelectMoon = useCallback((moon: MoonData, parentBody: CelestialBody) => {
    setSelectedMoon({ moon, parent: parentBody });
  }, []);

  const handleResetSelection = useCallback(() => {
    setSelectedBody(null);
    setSelectedMoon(null);
    speechService.stop();
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioService.setMuted(nextMuted);
    speechService.setMuted(nextMuted);
  }, [isMuted]);

  const handleToggleSpeechRate = useCallback(() => {
    const rates = [0.8, 1.0, 1.2];
    const currentIdx = rates.findIndex((r) => Math.abs(r - speechRate) < 0.1);
    const nextRate = rates[(currentIdx + 1) % rates.length];
    setSpeechRate(nextRate);
    speechService.setRate(nextRate);
  }, [speechRate]);

  const handleUpdateLightingSettings = useCallback((settings: Partial<LightingSettings>) => {
    setLightingSettings((prev) => ({ ...prev, ...settings }));
  }, []);

  const handleCycleBrightness = useCallback(() => {
    const presets = [1.0, 1.4, 1.8, 2.2];
    setLightingSettings((prev) => {
      const cur = prev.brightness;
      const next = presets.find((p) => p > cur + 0.05) || presets[0];
      return { ...prev, brightness: next };
    });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans text-slate-100 select-none">
      {/* 1. Top Bar */}
      <TopBar
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        speechRate={speechRate}
        onToggleSpeechRate={handleToggleSpeechRate}
        onResetView={handleResetSelection}
        brightness={lightingSettings.brightness}
        onCycleBrightness={handleCycleBrightness}
      />

      {/* 2. Three.js 3D WebGL Canvas */}
      <main className="w-full h-full">
        <SolarSystemCanvas
          selectedBodyId={selectedBody?.id || null}
          onSelectBody={handleSelectBody}
          onSelectMoon={(moon, parent) => handleSelectMoon(moon, parent)}
          isPaused={isPaused}
          timeSpeed={timeSpeed}
          orbitalOffset={orbitalOffset}
          onOrbitalOffsetChange={setOrbitalOffset}
          showOrbits={showOrbits}
          showLabels={showLabels}
          showMoons={showMoons}
          showAsteroids={showAsteroids}
          dragMode={dragMode}
          lightingSettings={lightingSettings}
          onUpdateLightingSettings={handleUpdateLightingSettings}
          onResetView={handleResetSelection}
        />
      </main>

      {/* 3. Interactive Orbital Controls & HUD */}
      <OrbitControlsHUD
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        timeSpeed={timeSpeed}
        onSpeedChange={setTimeSpeed}
        orbitalOffset={orbitalOffset}
        onOrbitalOffsetChange={setOrbitalOffset}
        showOrbits={showOrbits}
        showOrbitsToggle={() => setShowOrbits((prev) => !prev)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((prev) => !prev)}
        showMoons={showMoons}
        onToggleMoons={() => setShowMoons((prev) => !prev)}
        showAsteroids={showAsteroids}
        onToggleAsteroids={() => setShowAsteroids((prev) => !prev)}
        selectedBodyName={selectedBody?.name || null}
        onResetSelection={handleResetSelection}
        dragMode={dragMode}
        onDragModeChange={setDragMode}
        lightingSettings={lightingSettings}
        onUpdateLightingSettings={handleUpdateLightingSettings}
      />

      {/* 4. Bottom Planet Selector Tray */}
      <PlanetSelectorBar
        selectedBodyId={selectedBody?.id || null}
        onSelectBody={handleSelectBody}
      />

      {/* 5. Planet Inspection Card (Collapsible, Voice narration, facts, moons) */}
      {selectedBody && !selectedMoon && (
        <PlanetCardModal
          body={selectedBody}
          onClose={handleResetSelection}
          onSelectMoon={(moon) => handleSelectMoon(moon, selectedBody)}
        />
      )}

      {/* 6. Moon Details Popup */}
      {selectedMoon && (
        <MoonDetailsModal
          moon={selectedMoon.moon}
          parentBody={selectedMoon.parent}
          onClose={() => setSelectedMoon(null)}
          onBackToParent={() => setSelectedMoon(null)}
        />
      )}
    </div>
  );
}
