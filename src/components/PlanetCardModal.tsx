import React, { useEffect, useState } from 'react';
import {
  RotateCw,
  X,
  Thermometer,
  Clock,
  Calendar,
  Compass,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Moon as MoonIcon,
  Volume2,
  Gauge,
  BookOpen,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CelestialBody, MoonData } from '../types/solarSystem';
import { speechService, SpeechState } from '../utils/speechService';
import { audioService } from '../utils/audioService';

interface PlanetCardModalProps {
  body: CelestialBody;
  onClose: () => void;
  onSelectMoon: (moon: MoonData) => void;
}

export const PlanetCardModal: React.FC<PlanetCardModalProps> = ({
  body,
  onClose,
  onSelectMoon,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [speechState, setSpeechState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    currentWord: '',
    charIndex: 0,
    progressPercent: 0,
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'facts' | 'moons'>('overview');
  const [speechSpeed, setSpeechSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [speechMode, setSpeechMode] = useState<'all' | 'story'>('all');
  const [currentSpokenText, setCurrentSpokenText] = useState<string>('');

  // Subscribe to speech updates
  useEffect(() => {
    const unsubscribe = speechService.subscribe(setSpeechState);
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, []);

  // When body changes, stop any previous narration
  useEffect(() => {
    speechService.stop();
    setCurrentSpokenText('');
  }, [body.id]);

  // Build the comprehensive details speech text
  const getAllDetailsText = () => {
    const factsIntro = body.funFacts.length > 0 ? `Here is an exciting fun fact: ${body.funFacts[0]}` : '';
    return `${body.name}! ${body.tagline}. ${body.description} ${body.speechText} On ${body.name}, one full day takes ${body.dayLength}, and one complete orbit around the Sun takes ${body.yearLength}. Surface gravity is ${body.gravity}. The temperature averages ${body.temperature}, which means: ${body.temperatureKidDesc}. ${factsIntro}`;
  };

  const getStoryText = () => {
    return body.speechText;
  };

  // Synchronous user click handler for browser activation
  const handleToggleSpeak = (mode?: 'all' | 'story') => {
    audioService.playClick();
    const targetMode = mode || speechMode;
    if (mode) setSpeechMode(mode);

    if (speechState.isSpeaking) {
      if (speechState.isPaused) {
        speechService.resume();
      } else {
        speechService.pause();
      }
    } else {
      const textToSpeak = targetMode === 'all' ? getAllDetailsText() : getStoryText();
      setCurrentSpokenText(textToSpeak);
      speechService.speak(textToSpeak);
    }
  };

  const handleSpeakCustom = (text: string) => {
    audioService.playClick();
    setCurrentSpokenText(text);
    speechService.speak(text);
  };

  const handleReplaySpeak = () => {
    audioService.playClick();
    const textToSpeak = speechMode === 'all' ? getAllDetailsText() : getStoryText();
    setCurrentSpokenText(textToSpeak);
    speechService.speak(textToSpeak);
  };

  const handleChangeSpeed = (speed: 'slow' | 'normal' | 'fast') => {
    audioService.playClick();
    setSpeechSpeed(speed);
    const rateVal = speed === 'slow' ? 0.8 : speed === 'fast' ? 1.2 : 0.95;
    speechService.setRate(rateVal);
  };

  // Helper to highlight words karaoke style
  const renderKaraokeText = (fullText: string, activeWord: string) => {
    const textToShow = fullText || getAllDetailsText();
    if (!speechState.isSpeaking || !activeWord) {
      return <span>{textToShow}</span>;
    }
    const cleanActive = activeWord.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tokens = textToShow.split(/(\s+)/);

    return tokens.map((token, i) => {
      const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isCurrent = cleanToken && cleanToken === cleanActive;
      if (isCurrent) {
        return (
          <span
            key={i}
            className="bg-amber-400 text-black font-extrabold px-1 rounded-sm shadow-xs transition-all"
          >
            {token}
          </span>
        );
      }
      return <span key={i}>{token}</span>;
    });
  };

  if (isCollapsed) {
    return (
      <div className="absolute top-18 right-6 z-20 flex items-center gap-3 p-3 bg-slate-950/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl select-none animate-in fade-in slide-in-from-top-2 duration-200">
        <div
          className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center shrink-0 shadow-md"
          style={{
            backgroundColor: body.color,
            boxShadow: `0 0 14px ${body.color}aa`,
          }}
        >
          {body.type === 'star' ? (
            <Sparkles className="w-5 h-5 text-black" />
          ) : body.hasRings ? (
            <RotateCw className="w-5 h-5 text-black" />
          ) : (
            <span className="text-black font-extrabold text-xs">{body.orderFromSun || '★'}</span>
          )}
        </div>

        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-extrabold text-white">{body.name}</h2>
            {speechState.isSpeaking && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 max-w-[150px] truncate">{body.tagline}</p>
        </div>

        {/* Mini Speak / Pause button */}
        <button
          onClick={() => handleToggleSpeak()}
          className={`p-2 rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer ${
            speechState.isSpeaking && !speechState.isPaused
              ? 'bg-emerald-400 text-black shadow-md'
              : 'bg-slate-900 border border-white/10 text-amber-400 hover:text-white hover:bg-slate-800'
          }`}
          title={speechState.isSpeaking ? (speechState.isPaused ? 'Resume Voice' : 'Pause Voice') : 'Listen to Details'}
        >
          {speechState.isSpeaking && !speechState.isPaused ? (
            <Pause className="w-4 h-4 fill-black" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Expand Button */}
        <button
          onClick={() => {
            audioService.playClick();
            setIsCollapsed(false);
          }}
          className="p-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
          title="Expand planet details popup"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:inline">Expand</span>
        </button>

        {/* Close Button */}
        <button
          onClick={() => {
            audioService.playClick();
            speechService.stop();
            onClose();
          }}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
          title="Close details"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-18 right-6 bottom-24 z-20 w-96 max-w-[calc(100vw-3rem)] flex flex-col bg-slate-950/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden select-none animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header Banner */}
      <div
        className="p-5 pb-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${body.color}45 0%, rgba(15, 23, 42, 0.98) 100%)`,
        }}
      >
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <button
            onClick={() => {
              audioService.playClick();
              setIsCollapsed(true);
            }}
            className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
            title="Collapse popup to view 3D planet"
            aria-label="Collapse popup"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              speechService.stop();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
            title="Close details"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center shrink-0 shadow-lg"
            style={{
              backgroundColor: body.color,
              boxShadow: `0 0 20px ${body.color}aa`,
            }}
          >
            {body.type === 'star' ? (
              <Sparkles className="w-6 h-6 text-black" />
            ) : body.hasRings ? (
              <RotateCw className="w-6 h-6 text-black" />
            ) : (
              <span className="text-black font-extrabold text-sm">{body.orderFromSun || '★'}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{body.name}</h2>
              {body.type === 'dwarf-planet' && (
                <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-md">
                  Dwarf Planet
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 italic">{body.tagline}</p>
          </div>
        </div>

        {/* Audio Narration Bar for Kids */}
        <div className="mt-4 p-3 bg-slate-900/95 border border-white/15 rounded-2xl flex flex-col gap-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  speechState.isSpeaking && !speechState.isPaused
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-slate-500'
                }`}
              ></span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                {speechState.isSpeaking
                  ? speechState.isPaused
                    ? 'Voice Paused'
                    : 'Speaking All Details...'
                  : 'Spoken Audio Guide'}
              </span>
            </div>

            {/* Speed selection */}
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
              {(['slow', 'normal', 'fast'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleChangeSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    speechSpeed === spd
                      ? 'bg-amber-400 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Voice speed: ${spd}`}
                >
                  {spd[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          {!speechState.isSpeaking ? (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => handleToggleSpeak('all')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 active:scale-98 text-black text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all border border-amber-300"
              >
                <Volume2 className="w-4 h-4 fill-black" />
                <span>Read All Details Aloud (Voice)</span>
              </button>

              <button
                onClick={() => handleToggleSpeak('story')}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-white/10"
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>Play Quick Kid's Story Only</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleSpeak()}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                {speechState.isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-black" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReplaySpeak}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition-colors cursor-pointer border border-white/10"
                title="Restart narration from start"
                aria-label="Restart speech"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  audioService.playClick();
                  speechService.stop();
                }}
                className="px-2.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs font-bold cursor-pointer active:scale-95 transition-all"
                title="Stop audio"
              >
                Stop
              </button>
            </div>
          )}

          {/* Real-time Spoken Text Preview with word-by-word karaoke highlight */}
          <div className="text-xs leading-relaxed text-slate-200 bg-black/60 p-2.5 rounded-xl border border-white/10 max-h-24 overflow-y-auto">
            <span className="text-amber-400 font-semibold mr-1">🎙️</span>
            {renderKaraokeText(currentSpokenText, speechState.currentWord)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-5 border-b border-white/10 bg-slate-950/70">
        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab('overview');
          }}
          className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Key Stats
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab('facts');
          }}
          className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'facts'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Cool Facts
        </button>
        {body.moons.length > 0 && (
          <button
            onClick={() => {
              audioService.playClick();
              setActiveTab('moons');
            }}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'moons'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoonIcon className="w-3 h-3" />
            <span>Moons ({body.moons.length})</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Description */}
            <p className="text-xs leading-relaxed text-slate-300">
              {body.description}
            </p>

            {/* Quick Fact Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Day Length */}
              <div className="p-3 bg-slate-900/90 border border-white/10 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>One Day Spin</span>
                  </div>
                  <button
                    onClick={() => handleSpeakCustom(`A day on ${body.name} lasts ${body.dayLength}.`)}
                    className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Speak day length"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs font-extrabold text-white">{body.dayLength}</div>
              </div>

              {/* Year Length */}
              <div className="p-3 bg-slate-900/90 border border-white/10 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>One Year Orbit</span>
                  </div>
                  <button
                    onClick={() => handleSpeakCustom(`A year on ${body.name} takes ${body.yearLength}.`)}
                    className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
                    title="Speak year length"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs font-extrabold text-white">{body.yearLength}</div>
              </div>

              {/* Temperature */}
              <div className="p-3 bg-slate-900/90 border border-white/10 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span>Temperature</span>
                  </div>
                  <button
                    onClick={() => handleSpeakCustom(`The temperature on ${body.name} averages ${body.temperature}, which is ${body.temperatureKidDesc}.`)}
                    className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Speak temperature"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs font-extrabold text-white">{body.temperature}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{body.temperatureKidDesc}</div>
              </div>

              {/* Gravity */}
              <div className="p-3 bg-slate-900/90 border border-white/10 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Surface Gravity</span>
                  </div>
                  <button
                    onClick={() => handleSpeakCustom(`The surface gravity on ${body.name} is ${body.gravity}.`)}
                    className="p-1 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Speak gravity"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs font-extrabold text-white">{body.gravity}</div>
              </div>
            </div>

            {/* Atmosphere & Composition Info */}
            <div className="p-3 bg-slate-900/90 border border-white/10 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">Has Atmosphere:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  body.hasAtmosphere
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {body.hasAtmosphere ? 'Yes' : 'No / Vacuum'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'facts' && (
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Did You Know? (Click speaker to listen)</span>
            </h4>
            <div className="space-y-2.5">
              {body.funFacts.map((fact, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-900/90 border border-white/10 rounded-2xl text-xs text-slate-200 leading-relaxed flex items-start justify-between gap-2.5 shadow-sm group hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{fact}</span>
                  </div>
                  <button
                    onClick={() => handleSpeakCustom(`Fun fact: ${fact}`)}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-amber-400 hover:text-black text-amber-300 transition-colors shrink-0 cursor-pointer"
                    title="Speak this fun fact"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'moons' && body.moons.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Known Moons: {body.moons.length}</span>
              <span className="text-[10px] text-amber-300">Click to inspect</span>
            </div>

            <div className="space-y-2">
              {body.moons.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    audioService.playClick();
                    onSelectMoon(m);
                  }}
                  className="w-full p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-amber-400/40 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-white/20"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${m.color} 60%, #475569 100%)`,
                      }}
                    />
                    <div>
                      <div className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors">
                        {m.name}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{m.description}</div>
                    </div>
                  </div>
                  <Compass className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="p-3 bg-slate-900/90 border-t border-white/10 text-center text-[10px] text-slate-400 font-medium">
        💡 Drag planet with mouse or trackpad to spin it on its axis!
      </div>
    </div>
  );
};
