import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Eye,
  EyeOff,
  Disc3,
  Info,
  ChevronDown,
  ChevronUp,
  FastForward,
  RotateCcw,
  Sun,
  Lightbulb,
  Sliders,
  Minimize2,
  Maximize2,
  Layers,
  MousePointer,
  Move,
} from 'lucide-react';
import { audioService } from '../utils/audioService';
import { LightingSettings } from '../types/solarSystem';

export type InteractionDragMode = 'spin' | 'orbit' | 'pan';

interface OrbitControlsHUDProps {
  isPaused: boolean;
  onTogglePause: () => void;
  timeSpeed: number;
  onSpeedChange: (speed: number) => void;
  orbitalOffset: number; // in degrees
  onOrbitalOffsetChange: (offset: number) => void;
  showOrbits: boolean;
  showOrbitsToggle: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showMoons: boolean;
  onToggleMoons: () => void;
  showAsteroids: boolean;
  onToggleAsteroids: () => void;
  selectedBodyName: string | null;
  onResetSelection: () => void;
  dragMode: InteractionDragMode;
  onDragModeChange: (mode: InteractionDragMode) => void;
  lightingSettings: LightingSettings;
  onUpdateLightingSettings: (settings: Partial<LightingSettings>) => void;
}

export const OrbitControlsHUD: React.FC<OrbitControlsHUDProps> = ({
  isPaused,
  onTogglePause,
  timeSpeed,
  onSpeedChange,
  orbitalOffset,
  onOrbitalOffsetChange,
  showOrbits,
  showOrbitsToggle,
  showLabels,
  onToggleLabels,
  showMoons,
  onToggleMoons,
  showAsteroids,
  onToggleAsteroids,
  selectedBodyName,
  onResetSelection,
  dragMode,
  onDragModeChange,
  lightingSettings,
  onUpdateLightingSettings,
}) => {
  // Main panel collapsed state (reduces to sleek minimal dock bar)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Accordion section states
  const [openSections, setOpenSections] = useState({
    orbit: true,
    lighting: false,
    drag: false,
    layers: false,
    info: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    audioService.playClick();
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const displayDegrees = Math.round(((orbitalOffset % 360) + 360) % 360);

  const handleStepRotate = (deltaDegrees: number) => {
    audioService.playOrbitWhoosh();
    onOrbitalOffsetChange(orbitalOffset + deltaDegrees);
  };

  return (
    <div className="absolute top-18 left-6 z-20 flex flex-col gap-2.5 max-w-sm w-full select-none pointer-events-none">
      {/* Active Focus Banner if planet is selected */}
      {selectedBodyName && (
        <div className="pointer-events-auto flex items-center justify-between px-4 py-2 bg-amber-400 text-black font-semibold text-xs rounded-2xl shadow-xl backdrop-blur-md border border-amber-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping"></span>
            <span>
              Inspecting: <strong className="font-extrabold text-sm">{selectedBodyName}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              audioService.playClick();
              onResetSelection();
            }}
            className="px-2.5 py-1 bg-black/85 hover:bg-black text-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Show All Planets
          </button>
        </div>
      )}

      {/* When Collapsed: Minimal Floating Bar */}
      {isPanelCollapsed ? (
        <div className="pointer-events-auto p-2 bg-slate-950/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audioService.playClick();
                onTogglePause();
              }}
              className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition-transform active:scale-95 flex items-center justify-center shadow-md cursor-pointer"
              title={isPaused ? 'Resume Orbit Simulation' : 'Pause Orbit Simulation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-black" /> : <Pause className="w-3.5 h-3.5 fill-black" />}
            </button>
            <div className="text-xs">
              <span className="font-extrabold text-white">
                {isPaused ? 'Paused' : `${timeSpeed}x Speed`}
              </span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                {displayDegrees}°
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                audioService.playClick();
                setIsPanelCollapsed(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              title="Expand Controls Panel"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand Panel</span>
            </button>
          </div>
        </div>
      ) : (
        /* When Expanded: Full Accordion Panel */
        <div className="pointer-events-auto p-4 bg-slate-950/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col gap-3 max-h-[calc(100vh-140px)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Header with Title & Collapse Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white">Orbit & Simulation HUD</h3>
                <span className="text-[10px] text-slate-400">
                  {isPaused ? 'Simulation paused' : 'Active planetary motion'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  audioService.playClick();
                  setIsPanelCollapsed(true);
                }}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                title="Collapse panel to free up view"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ================= Accordion 1: Orbit Simulation & Speeds ================= */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('orbit')}
              className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Disc3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Orbit & Rotation Controls</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-400 bg-black/40 px-1.5 py-0.5 rounded">
                  {timeSpeed}x • {displayDegrees}°
                </span>
                {openSections.orbit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {openSections.orbit && (
              <div className="p-3 pt-0 flex flex-col gap-3 border-t border-white/5 mt-1">
                {/* Play / Pause & Independent Speeds Badge */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      audioService.playClick();
                      onTogglePause();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-transform active:scale-95 flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 fill-black" /> : <Pause className="w-3.5 h-3.5 fill-black" />}
                    <span>{isPaused ? 'Resume Orbits' : 'Pause Orbits'}</span>
                  </button>

                  <div
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-amber-400/30 bg-amber-400/10 text-amber-300 flex items-center gap-1.5 shadow-xs"
                    title="All planets orbit and spin independently at their respective realistic Keplerian speeds"
                  >
                    <Disc3 className="w-3 h-3 text-amber-400" />
                    <span>Independent Speeds</span>
                  </div>
                </div>

                {/* Orbit Rotation Scrubber */}
                <div className="flex flex-col gap-1.5 p-2.5 bg-black/50 border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>Rotate Planets Around Sun</span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold text-xs">
                      {displayDegrees}°
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">0°</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={displayDegrees}
                      onChange={(e) => onOrbitalOffsetChange(parseFloat(e.target.value))}
                      className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      title="Drag to rotate all planets synchronously around the Sun"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">360°</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Step angle:</span>
                    <div className="flex items-center gap-1">
                      {[-45, -15, 15, 45].map((d) => (
                        <button
                          key={d}
                          onClick={() => handleStepRotate(d)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[10px] cursor-pointer active:scale-95 transition-all"
                        >
                          {d > 0 ? `+${d}°` : `${d}°`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Speed Selection */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                    <FastForward className="w-3 h-3 text-amber-400" />
                    <span>Speed:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {[0.5, 1, 2, 5, 10].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          audioService.playClick();
                          onSpeedChange(s);
                        }}
                        className={`px-2 py-0.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                          timeSpeed === s
                            ? 'bg-amber-400 text-black shadow-md'
                            : 'bg-slate-800/90 text-slate-300 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= Accordion 2: Lighting & Visibility ================= */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('lighting')}
              className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Planet Lighting & Visibility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-400 bg-black/40 px-1.5 py-0.5 rounded">
                  {Math.round(lightingSettings.brightness * 100)}%
                </span>
                {openSections.lighting ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {openSections.lighting && (
              <div className="p-3 pt-0 flex flex-col gap-2.5 border-t border-white/5 mt-1">
                {/* Brightness Slider */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[10px] text-slate-400 font-mono">60%</span>
                  <input
                    type="range"
                    min="0.6"
                    max="2.2"
                    step="0.1"
                    value={lightingSettings.brightness}
                    onChange={(e) => {
                      onUpdateLightingSettings({ brightness: parseFloat(e.target.value) });
                    }}
                    className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    title="Adjust illumination of all planets"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">220%</span>
                </div>

                {/* Lighting Presets */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      audioService.playClick();
                      onUpdateLightingSettings({ lightingMode: 'bright', probeHeadlight: true });
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center ${
                      lightingSettings.lightingMode === 'bright'
                        ? 'bg-amber-400 text-black border-amber-300'
                        : 'bg-slate-950/80 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    🌟 Kids Bright
                  </button>
                  <button
                    onClick={() => {
                      audioService.playClick();
                      onUpdateLightingSettings({ lightingMode: 'balanced', probeHeadlight: true });
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center ${
                      lightingSettings.lightingMode === 'balanced'
                        ? 'bg-amber-400 text-black border-amber-300'
                        : 'bg-slate-950/80 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    🔦 Probe Lamp
                  </button>
                  <button
                    onClick={() => {
                      audioService.playClick();
                      onUpdateLightingSettings({ lightingMode: 'realistic', probeHeadlight: false });
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center ${
                      lightingSettings.lightingMode === 'realistic'
                        ? 'bg-amber-400 text-black border-amber-300'
                        : 'bg-slate-950/80 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    🌑 Real Sun
                  </button>
                </div>

                {/* Camera Probe Light Toggle */}
                <button
                  onClick={() => {
                    audioService.playClick();
                    onUpdateLightingSettings({ probeHeadlight: !lightingSettings.probeHeadlight });
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-xl text-[10px] font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                    lightingSettings.probeHeadlight
                      ? 'bg-amber-400/20 border-amber-400/30 text-amber-300'
                      : 'bg-slate-950/80 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Camera Probe Flashlight</span>
                  </span>
                  <span className="font-mono font-bold text-[9px]">
                    {lightingSettings.probeHeadlight ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* ================= Accordion 3: Drag & Rotate Mode ================= */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('drag')}
              className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MousePointer className="w-3.5 h-3.5 text-amber-400" />
                <span>Mouse / Touch Drag Action</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-300 capitalize">
                  {dragMode === 'spin' ? 'Spin Planet' : dragMode === 'pan' ? 'Pan Camera' : 'Orbit View'}
                </span>
                {openSections.drag ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {openSections.drag && (
              <div className="p-3 pt-0 flex flex-col gap-2 border-t border-white/5 mt-1">
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  <button
                    onClick={() => {
                      audioService.playClick();
                      onDragModeChange('spin');
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      dragMode === 'spin'
                        ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                        : 'bg-slate-950/80 border-white/10 text-slate-300 hover:text-white'
                    }`}
                    title="Drag directly on a planet to spin it on its axis"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Spin Planet</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      onDragModeChange('pan');
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      dragMode === 'pan'
                        ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                        : 'bg-slate-950/80 border-white/10 text-slate-300 hover:text-white'
                    }`}
                    title="Drag to pan camera across any solar system area (also right-click drag)"
                  >
                    <Move className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Pan Focus</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      onDragModeChange('orbit');
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      dragMode === 'orbit'
                        ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                        : 'bg-slate-950/80 border-white/10 text-slate-300 hover:text-white'
                    }`}
                    title="Drag to orbit view around center"
                  >
                    <Disc3 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Orbit View</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================= Accordion 4: Visual Display Layers ================= */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('layers')}
              className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Visual Layers & Toggles</span>
              </div>
              {openSections.layers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.layers && (
              <div className="p-3 pt-0 border-t border-white/5 mt-1">
                <div className="grid grid-cols-4 gap-1.5 pt-2 text-xs">
                  <button
                    onClick={() => {
                      audioService.playClick();
                      showOrbitsToggle();
                    }}
                    className={`py-1.5 px-1 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      showOrbits
                        ? 'bg-slate-900 border-amber-400/50 text-amber-300'
                        : 'bg-slate-950/60 border-white/5 text-slate-500'
                    }`}
                  >
                    {showOrbits ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">Orbits</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      onToggleLabels();
                    }}
                    className={`py-1.5 px-1 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      showLabels
                        ? 'bg-slate-900 border-amber-400/50 text-amber-300'
                        : 'bg-slate-950/60 border-white/5 text-slate-500'
                    }`}
                  >
                    {showLabels ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">Names</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      onToggleMoons();
                    }}
                    className={`py-1.5 px-1 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      showMoons
                        ? 'bg-slate-900 border-amber-400/50 text-amber-300'
                        : 'bg-slate-950/60 border-white/5 text-slate-500'
                    }`}
                  >
                    {showMoons ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">Moons</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      onToggleAsteroids();
                    }}
                    className={`py-1.5 px-1 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      showAsteroids
                        ? 'bg-slate-900 border-amber-400/50 text-amber-300'
                        : 'bg-slate-950/60 border-white/5 text-slate-500'
                    }`}
                  >
                    {showAsteroids ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">Asteroids</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================= Accordion 5: Planet Orbit Speeds & Years ================= */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('info')}
              className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Orbit Speeds & Years Guide</span>
              </div>
              {openSections.info ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.info && (
              <div className="p-3 pt-0 border-t border-white/5 mt-1 space-y-2 text-[11px] animate-in fade-in duration-200">
                <p className="text-slate-300 leading-relaxed pt-2">
                  Planets closer to the Sun zip around much faster! Mercury only takes 88 days to complete an orbit, while distant Neptune takes 165 Earth years!
                </p>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-slate-400">
                  <div>• Mercury: 88 Earth days</div>
                  <div>• Venus: 225 Earth days</div>
                  <div>• Earth: 365.25 days (1 yr)</div>
                  <div>• Mars: 687 Earth days</div>
                  <div>• Jupiter: 12 Earth years</div>
                  <div>• Saturn: 29 Earth years</div>
                  <div>• Uranus: 84 Earth years</div>
                  <div>• Neptune: 165 Earth years</div>
                  <div>• Pluto: 248 Earth years</div>
                  <div>• Ceres: 4.6 Earth years</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
