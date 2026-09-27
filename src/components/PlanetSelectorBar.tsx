import React from 'react';
import { CELESTIAL_BODIES } from '../data/celestialBodies';
import { CelestialBody } from '../types/solarSystem';
import { audioService } from '../utils/audioService';

interface PlanetSelectorBarProps {
  selectedBodyId: string | null;
  onSelectBody: (body: CelestialBody) => void;
}

export const PlanetSelectorBar: React.FC<PlanetSelectorBarProps> = ({
  selectedBodyId,
  onSelectBody,
}) => {
  return (
    <div className="absolute bottom-4 left-6 right-6 z-20 pointer-events-none select-none">
      <div className="pointer-events-auto max-w-5xl mx-auto p-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {CELESTIAL_BODIES.map((body) => {
          const isSelected = selectedBodyId === body.id;
          return (
            <button
              key={body.id}
              onClick={() => {
                audioService.playPlanetSelect();
                onSelectBody(body);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-amber-400 text-black shadow-lg scale-105 ring-2 ring-amber-400/50'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/5 hover:border-white/20'
              }`}
            >
              {/* Miniature Planet Color Sphere */}
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                style={{
                  backgroundColor: body.color,
                  boxShadow: `0 0 8px ${body.color}88`,
                }}
              />
              <span>{body.name}</span>
              {body.type === 'dwarf-planet' && (
                <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-black/20 text-black' : 'bg-slate-800 text-amber-300'}`}>
                  Dwarf
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
