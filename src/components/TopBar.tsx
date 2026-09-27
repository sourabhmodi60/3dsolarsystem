import React from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle, Layers, Compass, Sun } from 'lucide-react';
import { audioService } from '../utils/audioService';

interface TopBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  speechRate: number;
  onToggleSpeechRate: () => void;
  onResetView: () => void;
  brightness: number;
  onCycleBrightness: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isMuted,
  onToggleMute,
  speechRate,
  onToggleSpeechRate,
  onResetView,
  brightness,
  onCycleBrightness,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3.5 bg-black/60 backdrop-blur-md border-b border-white/10 select-none">
      {/* Zone 1: Wordmark & Center Reset */}
      <div className="flex items-center gap-4">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            audioService.playClick();
            onResetView();
          }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:text-amber-400 transition-colors"
          title="Reset view to center"
        >
          <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]"></span>
          <span>CosmoKids 3D</span>
        </a>

        <button
          onClick={() => {
            audioService.playClick();
            onResetView();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-amber-400 bg-slate-900/60 hover:bg-slate-900 border border-white/10 rounded-xl transition-all cursor-pointer"
          title="Re-center camera to solar system overview"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Center Solar System</span>
        </button>
      </div>

      {/* Zone 2: Navigation Info / Hint */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium bg-black/30 px-3 py-1 rounded-full border border-white/5">
        <span>💡 Scroll / Pinch over any area to zoom directly into that area • Right-drag to pan</span>
      </div>

      {/* Zone 3: Actions (Lighting, Voice Speed, Mute) */}
      <div className="flex items-center gap-2.5">
        {/* Planet Lighting Quick Button */}
        <button
          onClick={() => {
            audioService.playClick();
            onCycleBrightness();
          }}
          className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-slate-900/80 hover:bg-slate-800 border border-amber-400/30 hover:border-amber-400/60 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          title="Click to cycle planet brightness: 100% -> 140% -> 180% -> 220%"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Light: {Math.round(brightness * 100)}%</span>
        </button>

        {/* Voice Speed Toggle */}
        <button
          onClick={onToggleSpeechRate}
          className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          title="Change Voice Speed"
        >
          Voice: {speechRate <= 0.85 ? 'Slow (Kids)' : speechRate >= 1.1 ? 'Fast' : 'Normal'}
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isMuted
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
              : 'bg-slate-900/80 border-white/10 text-slate-200 hover:bg-slate-800 hover:text-white'
          }`}
          title={isMuted ? 'Unmute voice and audio' : 'Mute audio'}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
