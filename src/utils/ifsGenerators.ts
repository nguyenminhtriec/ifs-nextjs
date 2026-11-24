/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScatterPoint, IFSPicture, IFSTransformation } from '../types';

export const IFS_TOTAL_POINTS = 20000;

// Curated aesthetic color schemes for IFS pictures
export const COLOR_SCHEMES: Record<string, string[]> = {
  blue_range: ["#60a5fa", "#3b82f6",    "#2563eb"],
  pink_rank: [
    "#e6a6d4",
    "#eb4799",
    "#bd175c",
  ],
  emerald_forest: [
    "#1af2b3",
    "#1abf80",
    "#1a8c4d",
    "#0d8040",
    "#d9f24d",
  ],
  cyber_neon: [
    "#0dd9f2",
    "#f226bf",
    "#8c40fa",
    "#1af2a6",
    "#facc26",
  ],
  cyber_yellow: [
    "#0dd9f2",
    "#f226bf",
    "#f2f280",
    "#1af2a6",
    "#facc26",
  ],
  cosmic_fire: [
    "#fa401a",
    "#faa626",
    "#f2e640",
    "#bf1a4d",
    "#590d66",
  ],
  deep_ocean: [
    "#1a73f2",
    "#0dbfe6",
    "#4de6d9",
    "#2640a6",
    "#80ccff",
  ],
  amethyst_dream: [
    "#b340f2",
    "#e066d9",
    "#7326bf",
    "#f2b3e6",
    "#4d1a80",
  ],
  golden_sol: [
    "#fad126",
    "#f28c1a",
    "#fff273",
    "#d9590d",
    "#a6400d",
  ],
  amethyst_yellow: [
    "#b340f2",
    "#e066d9",
    "#73bf26",
    "#f2b3e6",
    "#4d1a80",
  ],
};

const SCHEME_KEYS = Object.keys(COLOR_SCHEMES);

// Base Curated IFS Systems
interface RawIFSConfig {
  name: string;
  category: string;
  description: string;
  transforms: Omit<IFSTransformation, 'color'>[];
  preferredPalette: string;
}

const PRESET_IFS_CONFIGS: RawIFSConfig[] = [
  {
    name: 'Barnsley Fern',
    category: 'Botanical Fractal',
    description: 'Michael Barnsley classic self-similar spleenwort fern attractor with rachis and pinnae.',
    preferredPalette: 'emerald_forest',
    transforms: [
      { a: 0.0, b: 0.0, c: 0.0, d: 0.16, e: 0.0, f: 0.0, p: 0.01 },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0.0, f: 1.6, p: 0.85 },
      { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0.0, f: 1.6, p: 0.07 },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0.0, f: 0.44, p: 0.07 },
    ],
  },
  {
    name: 'Dragon Curve & Wings',
    category: 'Twin Dragon',
    description: 'Heighway twin dragon fractal boundary with 90° rotation contraction mappings.',
    preferredPalette: 'cyber_neon',
    transforms: [
      { a: 0.5, b: -0.5, c: 0.5, d: 0.5, e: 0.0, f: 0.0, p: 0.5 },
      { a: -0.5, b: -0.5, c: 0.5, d: -0.5, e: 1.0, f: 0.0, p: 0.5 },
    ],
  },
  {
    name: 'Canadian Maple Leaf',
    category: 'Botanical Fractal',
    description: 'Four-function affine iterated system forming an organic lobed leaf silhouette.',
    preferredPalette: 'cosmic_fire',
    transforms: [
      { a: 0.14, b: 0.01, c: 0.0, d: 0.51, e: -0.08, f: -1.31, p: 0.1 },
      { a: 0.43, b: 0.52, c: -0.45, d: 0.5, e: 1.49, f: -0.75, p: 0.35 },
      { a: 0.45, b: -0.49, c: 0.47, d: 0.47, e: -1.62, f: -0.74, p: 0.35 },
      { a: 0.49, b: 0.0, c: 0.0, d: 0.51, e: 0.02, f: 1.62, p: 0.2 },
    ],
  },
  {
    name: 'Fractal Tree Canopy',
    category: 'Arboreal IFS',
    description: 'Self-similar recursive branching tree canopy with central trunk and bilateral twigs.',
    preferredPalette: 'emerald_forest',
    transforms: [
      { a: 0.05, b: 0.0, c: 0.0, d: 0.6, e: 0.0, f: 0.0, p: 0.1 },
      { a: 0.05, b: 0.0, c: 0.0, d: -0.5, e: 0.0, f: 1.0, p: 0.1 },
      { a: 0.46, b: -0.32, c: 0.39, d: 0.38, e: 0.0, f: 0.6, p: 0.4 },
      { a: 0.47, b: -0.15, c: 0.17, d: 0.42, e: 0.0, f: 1.1, p: 0.4 },
    ],
  },
  {
    name: 'Sierpinski Pentigree',
    category: 'Sacred Geometry',
    description: 'Contractive affine tiling with pentagonal symmetry and nested recursive voids.',
    preferredPalette: 'amethyst_dream',
    transforms: [
      { a: 0.382, b: 0.0, c: 0.0, d: 0.382, e: 0.0, f: 0.618, p: 0.2 },
      { a: 0.382, b: 0.0, c: 0.0, d: 0.382, e: 0.588, f: 0.191, p: 0.2 },
      { a: 0.382, b: 0.0, c: 0.0, d: 0.382, e: 0.363, f: -0.5, p: 0.2 },
      { a: 0.382, b: 0.0, c: 0.0, d: 0.382, e: -0.363, f: -0.5, p: 0.2 },
      { a: 0.382, b: 0.0, c: 0.0, d: 0.382, e: -0.588, f: 0.191, p: 0.2 },
    ],
  },
  {
    name: 'Golden Nautilus Spiral',
    category: 'Logarithmic IFS',
    description: 'Triple spiral transformation generating logarithmic whorls and nautilus shell chambers.',
    preferredPalette: 'golden_sol',
    transforms: [
      { a: 0.787879, b: -0.424242, c: 0.242424, d: 0.859848, e: 1.758647, f: 1.408065, p: 0.89 },
      { a: -0.121212, b: 0.257576, c: 0.151515, d: 0.05303, e: -0.372412, f: 0.596767, p: 0.06 },
      { a: 0.181818, b: 0.0, c: 0.0, d: 0.181818, e: 0.035512, f: 0.660936, p: 0.05 },
    ],
  },
  {
    name: 'Lively Tree',
    category: 'Lively Tree',
    description: 'Triple spiral transformation generating logarithmic whorls and nautilus shell chambers.',
    preferredPalette: 'emerald_forest',
    transforms: [
      { a: 0.47 , b: -0.12, c: -0.09, d: -0.57, e: 0.43 , f: 0.42 , p: 0.30 },
      { a: 0.76 , b: -0.37 , c: 0.54, d: 0.49 , e: 0.16 , f: 0.69 , p: 0.40 },
      { a: -0.30 , b: -0.58, c: -0.12, d: 0.01 , e: 0.40 , f: 0.40 , p: 0.30 },
    ],
  },

  {
    name: 'Mild String',
    category: 'Mild String',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.26, b: -0.02, e: 0.85, c: 0.43, d: 0.66, f: 0.62, p: 0.45 },
      { a: 0.68, b: 0.28, e: -0.08, c: -0.08, d: 0.58, f: 0.06, p: 0.45 },
      { a: 0.51, b: 0.43, e: 1.17, c: 0.18, d: 0.77, f: 0.59, p: 0.10 },
    ],
  },

  {
    name: 'Tiny Leaf',
    category: 'Crystallography',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.626, b: 0.290, c: -0.209, d: 0.352, e: 0.457, f: 0.201, p: 0.60 },
      { a: 0.555, b: 0.321, c: 0.211, d: 0.621, e: 0.485, f: 0.039, p: 0.30 },
      { a: 0.58, b: 0.227, c: -0.489, d: -0.417, e: 0.597, f: 0.390, p: 0.10 },
    ],
  },
  {
    name: 'Strong Leaf',
    category: 'Strong Leaf',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.612, b: 0.055, c: -0.184, d: -0.606, e: 0.510, f: -0.100, p: 0.60 }, //e:0610
      { a: 0.191, b: 0.355, c: -0.543, d: 0.607, e: 0.059, f: 0.173, p: 0.30 }, //e:0159
      { a: 0.013, b: 0.108, c: 0.335, d: 0.306, e: 0.362, f: 0.076, p: 0.10 }, //e:0362
    ],
  },
  {
    name: 'Happy Leaf',
    category: 'Happy Leaf',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.530, b: 0.404, c: -0.495, d: 0.629, e: 0.620, f: 0.538, p: 0.60 },
      { a: 0.209, b: 0.388, c: 0.607, d: 0.331, e: 0.574, f: 0.404, p: 0.30 },
      { a: 0.341, b: 0.004, c: -0.584, d: -0.465, e: 0.108, f: -0.625, p: 0.10 },
    ],
  },

  {
    name: 'Smart Leaf',
    category: 'Smart Leaf',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.612, b: 0.015, c: -0.184, d: -0.606, e: 0.510, f: -0.100, p: 0.60 }, //e:0610
      { a: 0.251, b: 0.455, c: -0.543, d: 0.607, e: 0.059, f: 0.173, p: 0.30 }, //e:0159
      { a: 0.013, b: 0.108, c: 0.335, d: 0.306, e: 0.362, f: 0.076, p: 0.10 }, //e:0362
    ],
  },

  {
    name: 'Sky Leaf',
    category: 'Sky Leaf',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.600, b: 0.400, c: 0.065, d: 0.524, e: 0.457, f: 0.197 , p: 0.60 }, //e:0610
      { a: 0.171, b: 0.215, c: 0.067, d: -0.551, e: 0.583, f: -0.312, p: 0.20 }, //e:0159
      { a: 0.520, b: 0.347, c: 0.169, d: 0.512, e: 0.522, f: -0.148, p: 0.20 }, //e:0362
    ],
  },

  {
    name: 'Wave Tops',
    category: 'Wave Tops',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.087, b: 0.518, e: 0.074 , c: 0.468, d: -0.529, f: -0.263 , p: 0.60 }, //e:0610
      { a: 0.374, b: 0.413, e: 0.111, c: -0.477 , d: 0.538, f: 0.520 , p: 0.20 }, //e:0159
      { a: 0.539, b: 0.343, e: 0.059, c: -0.180, d: 0.466, f: 0.534 , p: 0.20 }, //e:0362
    ],
  },

  {
    name: 'Mountain Leaf',
    category: 'Mountain Leaf',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.232, b: 0.039, e: 0.420 , c: -0.321, d: 0.921, f: 0.361 , p: 0.50 }, 
      { a: 0.633, b: 0.070, e: 0.468, c: -0.106, d: 0.600, f: 0.861 , p: 0.45 },
      { a: 0.343, b: 0.381, e: 0.324, c: 0.525, d: -0.418, f: 0.283 , p: 0.05 },
    ],
  },

  {
    name: 'Flower Wave',
    category: 'Flower Wave',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.557, b: 0.370, e: 0.533 , c: -0.213, d: 0.745, f: 0.330 , p: 0.48 }, 
      { a: 0.501, b: 0.245, e: 0.150, c: 0.502, d: -0.366, f: 0.666, p: 0.48 },
      { a: 0.318, b: 0.265, e: 0.241, c: 0.604, d: 0.398, f: 0.301, p: 0.04 },
    ],
  },

  {
    name: 'Curly Wave',
    category: 'Curly Wave',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.250, b: 0.216, e: 0.550, c: 0.468, d: 0.045, f: 0.731 , p: 0.3 }, 
      { a: 0.510, b: 0.557, e: 0.409, c: -0.205, d: 0.979, f: 0.659, p: 0.6 },
      { a: 0.135, b: 0.122, e: 0.138, c: -0.203, d: 0.485, f: 0.910, p: 0.1},
    ],
  },

  {
    name: 'Beam in Foggy Sky',
    category: 'Beam in Foggy Sky',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.660, b: 0.516, e: 0.213, c: 0.511, d: 0.398, f: -0.395 , p: 0.3 }, 
      { a: 0.644, b: 0.402, e: 0.384, c: 0.818, d: -0.876, f: 0.113, p: 0.6 },
      { a: 0.342, b: 0.557, e: 0.488, c: 0.792, d: 0.442, f: 0.800, p: 0.1},
    ],
  },

  {
    name: 'Strong Waves',
    category: 'Crystallography',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      {'a': 0.589,  'b': 0.625,  'e': 0.409, 'c': -0.614,  'd': 0.361,  'f': 0.115,  'p': 0.6 },
      {'a': 0.166,  'b': 0.549,  'e': 0.494,  'c': -0.446,  'd': 0.4542,  'f': -0.299,  'p': 0.3 },
      {'a': 0.534,  'b': 0.100,  'e': 0.047,  'c': 0.448,  'd': 0.084,  'f': 0.0471,  'p': 0.1}
    ],
  },

  {
    name: 'Coconut Shadows',
    category: 'Crystallography',
    description: 'Hexagonal crystallographic contraction mappings yielding delicate dendrite branches.',
    preferredPalette: 'deep_ocean',
    transforms: [
      { a: 0.356, b: 0.439, c: 0.586, d: -0.114, e: 0.011, f: -0.637, p: 0.60 },
      { a: 0.396, b: 0.513, c: -0.369, d: 0.660, e: 0.314, f: 0.600, p: 0.30 },
      { a: 0.621, b: 0.114, c: 0.248, d: -0.762, e: 0.466, f: 0.243, p: 0.10 },
    ],
  },
];

/**
 * Procedurally generates a unique contractive random IFS configuration
 */
export function generateRandomIFSConfig(): RawIFSConfig {
  const numTransforms = 3; // Math.floor(Math.random() * 3) + 2; // 2 to 4 transforms
  const transforms: Omit<IFSTransformation, 'color'>[] = [];
  const paletteName = SCHEME_KEYS[Math.floor(Math.random() * SCHEME_KEYS.length)];

  const adjectiveNames = [
    'Nebular', 'Quantum', 'Starlight', 'Galactic', 'Prismatic',
    'Vortex', 'Hyperbolic', 'Chrono', 'Bifurcation', 'Aether',
    'Harmonic', 'Solar', 'Crystalline', 'Fractal', 'Chaotic'
  ];
  const nounNames = [
    'Attractor', 'Manifold', 'Whorl', 'Matrix', 'Loom',
    'Cascade', 'Plexus', 'Filament', 'Bloom', 'Labyrinth',
    'Constellation', 'Singularity', 'Polytope', 'Strand'
  ];
  const randomName = `${adjectiveNames[Math.floor(Math.random() * adjectiveNames.length)]} ${
    nounNames[Math.floor(Math.random() * nounNames.length)]
  }`;

  // let totalProb = 0;
  // const probs: number[] = [];

  for (let i = 0; i < numTransforms; i++) {
    // Contractive scale factor (guarantees convergence to compact attractor)
    // const scaleX = 0.25 + Math.random() * 0.45;
    // const scaleY = 0.25 + Math.random() * 0.45;
    // const angleX = (Math.random() - 0.5) * Math.PI * 1.8;
    // const angleY = (Math.random() - 0.5) * Math.PI * 1.8;

    // const a = scaleX * Math.cos(angleX);
    // const b = -scaleY * Math.sin(angleY);
    // const c = scaleX * Math.sin(angleX);
    // const d = scaleY * Math.cos(angleY);

    // const e = (Math.random() - 0.5) * 1.8;
    // const f = (Math.random() - 0.5) * 1.8;

    // Weight by determinant with baseline
    // const det = Math.abs(a * d - b * c);
    // const weight = Math.max(0.1, det);
    // probs.push(weight);
    // totalProb += weight;* 0.8 - 0.4; // [-0.4, 0.4]

    const a = Math.random() * 1.6 - .8;
    const b = Math.random() * 1.6 - .8;  
    const c = Math.random() * 1.2 - .6; 
    const d = Math.random() * 1.2 - .6; 
    const e = Math.random() * .7; 
    const f = Math.random() * .7; 

    transforms.push({ a, b, c, d, e, f, p: 0 });
  }

  // Set probabilities for each transform
  const probs = [.6, .2, .2]  // generateProbArray(numTransforms);
  for (let i = 0; i < transforms.length; i++) {
    transforms[i].p = probs[i];
  }

  return {
    name: randomName,
    category: 'Procedural IFS',
    description: `Stochastic contractive iterated function system with ${numTransforms} affine contraction mappings.`,
    preferredPalette: paletteName,
    transforms,
  };
}

 /**
   * Creates an offscreen 2D canvas thumbnail for an array of points
   */
function createThumbnail(points: ScatterPoint[]): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#060911';
  ctx.fillRect(0, 0, 160, 160);

  // Draw # representative points for instant crisp preview
  const step = Math.ceil(points.length / 5000);
  for (let i = 0; i < points.length; i += step) {
    const p = points[i];
    // Map [-100, 100] to [10, 150]
    const px = 80 + (p.x / 100) * 65;
    const py = 80 - (p.y / 100) * 65;

    ctx.fillStyle = p.color;
    ctx.fillRect(px, py, .5, .5);
  }
  return canvas.toDataURL('image/png');
}

// Pseudo-random seeded generator for consistent deterministic beauty and zero hydration mismatches
function createSeededRng(seed = 12345) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generates a random probability distribution for a given number of transforms
function generateProbArray(numTransforms: number): number[] {
  const probabilities: number[] = [];
  let totalProb = 0;
  for (let i = 0; i < numTransforms; i++) {
    const prob = Math.random();
    probabilities.push(prob);
    totalProb += prob;
  }
  // Normalize probabilities
  for (let i = 0; i < probabilities.length; i++) {
    probabilities[i] /= totalProb;
  }
  return probabilities;
}

// Generate scatterPoints
function generateScatterPoints(config?: RawIFSConfig): {
    cfg: RawIFSConfig, 
    points: ScatterPoint[],
    fullTransforms: IFSTransformation[]
  } {
   // 1. Point Generation Phase (10,000 points)const isDeterministic = typeof seed === 'number';
  const rng = Math.random();

  const cfg = config || (rng > 0.9 //0.45
    ? generateRandomIFSConfig()
    : PRESET_IFS_CONFIGS[Math.floor(rng * PRESET_IFS_CONFIGS.length)]);

  const paletteColors = COLOR_SCHEMES[cfg.preferredPalette] || COLOR_SCHEMES.cyber_neon;

  // Complete transformations with assigned colors
  const fullTransforms: IFSTransformation[] = cfg.transforms.map((t, idx) => ({
    ...t,
    color: paletteColors[idx % paletteColors.length],
  }));

  const rawCoords: { x: number; y: number; transformIdx: number }[] = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const probArray = fullTransforms.map(t => t.p);

  let x = 0.0;
  let y = 0.0;

  for (let i = 0; i < IFS_TOTAL_POINTS; i++) {
    const chosenIdx = getTransformIndex(probArray);
    const t = fullTransforms[chosenIdx];
    const nx = t.a * x + t.b * y + t.e;
    const ny = t.c * x + t.d * y + t.f;
    x = nx;
    y = ny;

    rawCoords.push({ x, y, transformIdx: chosenIdx });

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  // 2. Normalization to Chart Space [-88, 88]
  const spanX = Math.max(0.0001, maxX - minX);
  const spanY = Math.max(0.0001, maxY - minY);
  // const maxSpan = Math.max(spanX, spanY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const points: ScatterPoint[] = [];

  for (let i = 0; i < IFS_TOTAL_POINTS; i++) {
    const item = rawCoords[i];
    // Center and scale symmetrically so aspect ratio is preserved
    const normX = ((item.x - centerX) / spanX) * 176; 
    const normY = ((item.y - centerY) / spanY) * 176;

    const baseColor = fullTransforms[item.transformIdx].color;
    // // Slight brightness modulation based on distance from attractor center
    const dist = Math.sqrt(normX * normX + normY * normY) / 100;
    const intensity = Math.max(0.2, Math.min(1.0, 1.0 - dist * 0.45));

    points.push({
      id: i,
      x: Number(normX.toFixed(3)),
      y: Number(normY.toFixed(3)),
      color: baseColor,
      size: 1,
      intensity
    });
  }
  return { cfg, points, fullTransforms };
}

/**
 * Synthesizes an IFSPicture containing exactly 10,000 data points
 * using the Chaos Game algorithm on contractive affine maps
 */
export function createIFSPicture(presetName?: string): IFSPicture {
  
  const presetConfigs = getCuratedPresets()
  const config: RawIFSConfig = presetConfigs.find(p => p.name === presetName) ?? undefined
  
  const {cfg, points, fullTransforms} = presetName ? generateScatterPoints(config) : generateScatterPoints(undefined);
  const thumbnailUrl = createThumbnail(points);

  const picId = `ifs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = Date.now();

  return {
    id: picId,
    name: cfg.name,
    category: cfg.category,
    description: cfg.description,
    createdAt,
    points,
    thumbnailUrl,
    transformations: fullTransforms,
    paletteName: cfg.preferredPalette,
    pointCount: IFS_TOTAL_POINTS,
  };
}

/**
 * Returns a list of curated templates for the user to pick from if desired
 */
export function getCuratedPresets(): RawIFSConfig[] {
  return PRESET_IFS_CONFIGS;
}

/** 
 *  Get chosen index of transform based on random number and cumulative distribution function
*/
function getTransformIndex(probArray: number[]): number {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < probArray.length; i++) {
    cumulative += probArray[i];
    if (r <= cumulative) {
      return i;
    }
  }
  return probArray.length - 1; // Fallback in case of rounding errors
}
