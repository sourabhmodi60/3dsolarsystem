import React, { useState, useEffect } from 'react';
import { X, Volume2, Sparkles, Compass, Play, Pause } from 'lucide-react';
import { MoonData, CelestialBody } from '../types/solarSystem';
import { speechService, SpeechState } from '../utils/speechService';
import { audioService } from '../utils/audioService';

interface MoonDetailsModalProps {
  moon: MoonData;
  parentBody: CelestialBody;
  onClose: () => void;
  onBackToParent: () => void;
}

export const MoonDetailsModal: React.FC<MoonDetailsModalProps> = ({
  moon,
  parentBody,
  onClose,
  onBackToParent,
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    currentWord: '',
    charIndex: 0,
    progressPercent: 0,
  });

  useEffect(() => {
    const unsub = speechService.subscribe(setSpeechState);
    return () => {
      unsub();
      speechService.stop();
    };
  }, []);

  const handleToggleSpeak = () => {
    audioService.playClick();
    if (speechState.isSpeaking) {
      if (speechState.isPaused) {
        speechService.resume();
      } else {
        speechService.pause();
      }
    } else {
      speechService.speak(moon.speechText);
    }
  };

  return (
    <div className="absolute top-18 right-6 z-30 w-88 max-w-[calc(100vw-3rem)] bg-slate-950/95 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 select-none animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Spherical Moon Badge with 3D Crater Shading */}
          <div
            className="w-10 h-10 rounded-full shrink-0 shadow-lg relative overflow-hidden border border-white/30"
            style={{
              background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${moon.color} 50%, #475569 100%)`,
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.25)',
            }}
          >
            {/* Crater details */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-500/40 border border-white/40" />
            <div className="absolute bottom-2.5 right-2 w-3 h-3 rounded-full bg-slate-600/40 border border-white/30" />
            <div className="absolute top-5 right-3 w-1.5 h-1.5 rounded-full bg-slate-500/40" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-white">{moon.name}</h3>
            <span className="text-[11px] text-slate-300">
              Natural Moon of {parentBody.name}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            audioService.playClick();
            speechService.stop();
            onClose();
          }}
          className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close details"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-slate-200">
        {moon.description}
      </p>

      {/* Spoken Audio Guide Button */}
      <button
        onClick={handleToggleSpeak}
        className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-black text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer border border-amber-300 active:scale-98"
      >
        {speechState.isSpeaking && !speechState.isPaused ? (
          <>
            <Pause className="w-4 h-4 fill-black" />
            <span>Pause Voice Guide</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            <span>Listen to {moon.name} Speak!</span>
          </>
        )}
      </button>

      {/* Spoken Text Display with Highlight */}
      {speechState.isSpeaking && (
        <div className="p-2.5 rounded-xl bg-black/60 border border-amber-400/30 text-xs text-amber-200 animate-in fade-in duration-200">
          <p className="leading-relaxed italic">"{moon.speechText}"</p>
        </div>
      )}

      {/* Fun Fact Box */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-300 leading-snug">
          <strong className="text-amber-300 font-semibold">Did You Know? </strong>
          {moon.funFact}
        </div>
      </div>

      {/* Return to parent planet button */}
      <button
        onClick={() => {
          audioService.playClick();
          speechService.stop();
          onBackToParent();
        }}
        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-white/15 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span>View Entire {parentBody.name} System</span>
      </button>
    </div>
  );
};
