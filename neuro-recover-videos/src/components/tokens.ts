// Neuro-Recover Brand Design Tokens
export const COLORS = {
  // Primary brand
  brain: '#7C3AED',        // Deep purple - AI/brain
  brainLight: '#A78BFA',   // Light purple
  brainDark: '#4C1D95',    // Dark purple
  
  // Accent
  neural: '#06B6D4',       // Cyan - neural connections
  neuralLight: '#67E8F9',  // Light cyan
  
  // Energy / progress
  energy: '#10B981',       // Emerald green - progress/health
  energyLight: '#6EE7B7',  // Light green
  
  // Alert / warmth
  warmth: '#F59E0B',       // Amber - warmth/gamification
  
  // Neutrals
  dark: '#0F0A1E',         // Near-black with purple tint
  darkMid: '#1A1035',      // Dark mid
  surface: '#241A50',      // Card surface
  surfaceLight: '#362870', // Lighter surface
  
  white: '#FFFFFF',
  whiteAlpha70: 'rgba(255,255,255,0.7)',
  whiteAlpha40: 'rgba(255,255,255,0.4)',
  whiteAlpha20: 'rgba(255,255,255,0.2)',
  whiteAlpha10: 'rgba(255,255,255,0.1)',
};

export const FONTS = {
  heading: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  body: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"SF Mono", "Fira Code", monospace',
};

// 3 minutes = 180 seconds at 30fps = 5400 frames
export const VIDEO_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationFrames: 5400, // 3 minutes
};
