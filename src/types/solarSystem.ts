export type CelestialType = 'star' | 'planet' | 'dwarf-planet' | 'moon';

export interface MoonData {
  id: string;
  name: string;
  radius: number; // visual radius relative to Earth = 1
  distance: number; // distance from parent planet
  orbitalSpeed: number; // relative orbital speed around planet
  color: string;
  description: string;
  speechText: string;
  funFact: string;
}

export interface CelestialBody {
  id: string;
  name: string;
  type: CelestialType;
  orderFromSun: number;
  radius: number; // visual scale in scene
  realDiameterKm: number;
  distanceFromSunAU: number;
  orbitalRadius: number; // 3D units in scene
  orbitalSpeed: number; // speed around sun
  rotationSpeed: number; // speed on own axis
  axialTilt: number; // in degrees
  color: string;
  atmosphereColor?: string;
  hasAtmosphere?: boolean;
  hasClouds?: boolean;
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringColor?: string;
  moons: MoonData[];
  temperature: string;
  temperatureKidDesc: string;
  dayLength: string;
  yearLength: string;
  gravity: string;
  tagline: string;
  description: string;
  speechText: string;
  funFacts: string[];
  kidQuizClues: string[];
  category: 'inner-planet' | 'outer-gas-giant' | 'ice-giant' | 'star' | 'dwarf-planet';
}

export interface QuizQuestion {
  id: string;
  targetBodyId: string;
  question: string;
  speechPrompt: string;
  options: { id: string; name: string }[];
  correctAnswerId: string;
  explanation: string;
}

export type LightingMode = 'bright' | 'balanced' | 'realistic';

export interface LightingSettings {
  brightness: number; // e.g. 0.6 to 2.2, default 1.4
  lightingMode: LightingMode;
  probeHeadlight: boolean; // default true
}
