/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScatterPoint {
  id: number;
  x: number;       // Normalized coordinate in [-100, 100]
  y: number;       // Normalized coordinate in [-100, 100]
  r: number;       // Red [0, 1]
  g: number;       // Green [0, 1]
  b: number;       // Blue [0, 1]
  a: number;       // Alpha [0, 1]
  size: number;    // Point size multiplier [0.5, 3.0]
  intensity: number; // Luminance / density [0, 1]
  cluster: number; // Index of IFS transform that generated this point
  label?: string;  // Region or IFS transform description
}

export interface IFSTransformation {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  p: number;       // Probability [0, 1]
  color: [number, number, number]; // Base RGB
}

export interface IFSPicture {
  id: string;
  name: string;
  category: string;
  description: string;
  createdAt: number;
  points: ScatterPoint[];
  thumbnailUrl: string; // 2D canvas thumbnail
  transformations: IFSTransformation[];
  paletteName: string;
  pointCount: number; // 10000
}

export type ColorMapMode =
  | 'original'
  | 'viridis'
  | 'plasma'
  | 'turbo'
  | 'spectral'
  | 'laser_cyan'
  | 'cyber_amber';

export type PointShape = 'circle' | 'glow' | 'disc' | 'diamond' | 'ring';

export type BlendMode = 'normal' | 'additive';

export interface SelectionStats {
  count: number;
  avgX: number;
  avgY: number;
  avgIntensity: number;
  dominantColor: string;
}

export type PresetKey = string;

