'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ScatterPoint,
  IFSPicture,
  ColorMapMode,
  PointShape,
  BlendMode,
  SelectionStats,
} from '../types';
import { getCuratedPresets } from '../utils/ifsGenerators';
import {
  Sparkles,
  Shuffle,
  Download,
  FileCode,
  Camera,
  Layers,
  Sliders,
  Images,
  ExternalLink,
} from 'lucide-react';

interface Props {
  activePicture: IFSPicture;
  pictures: IFSPicture[];
  onSelectPicture: (pic: IFSPicture) => void;
  onGenerateNewPicture: (presetName?: string) => void;
  onOpenGallery: () => void;
  pointSize: number;
  onPointSizeChange: (size: number) => void;
  opacity: number;
  onOpacityChange: (op: number) => void;
  colorMapMode: ColorMapMode;
  onColorMapChange: (mode: ColorMapMode) => void;
  pointShape: PointShape;
  onPointShapeChange: (shape: PointShape) => void;
  blendMode: BlendMode;
  onBlendModeChange: (blend: BlendMode) => void;
  jitter: number;
  onJitterChange: (j: number) => void;
  selectionStats: SelectionStats | null;
  
}

export const ControlPanel: React.FC<Props> = ({
  activePicture,
  pictures,
  onSelectPicture,
  onGenerateNewPicture,
  onOpenGallery,
  pointSize,
  onPointSizeChange,
  opacity,
  onOpacityChange,
  colorMapMode,
  onColorMapChange,
  pointShape,
  onPointShapeChange,
  blendMode,
  onBlendModeChange,
  jitter,
  onJitterChange,
  selectionStats,
}) => {
  const curatedTemplates = getCuratedPresets();

  return (
    <div className="w-full flex flex-col gap-4 text-slate-200">
      {/* 1. Primary Action: Generate New IFS Picture */}
      <div className="p-3.5 bg-linear-to-br from-cyan-950/40 via-[#0d1322] to-[#090d16] border border-cyan-500/40 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              Generate New Picture
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300">
            10,000 Points
          </span>
        </div>

        {/* Big New Picture Button */}
        <button
          onClick={() => onGenerateNewPicture()}
          className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
          <span>New Picture (Random IFS)</span>
        </button>

        {/* Quick Template Picker */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-400 block">
            Or pick specific IFS fractal:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {curatedTemplates.slice(0, 4).map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => onGenerateNewPicture(tpl.name)}
                className="py-1 px-2 text-[10px] font-medium bg-[#0b101d] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-slate-300 hover:text-white truncate transition-colors cursor-pointer text-left"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Stored Pictures Array Indicator (Max = 10) */}
      <div className="p-3 bg-[#0d1322] border border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Images className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              Saved Pictures
            </span>
          </div>
          <button
            onClick={onOpenGallery}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({pictures.length}/10)</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Horizontal Mini Thumbnails */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {pictures.map((pic, idx) => {
            const isCurrent = pic.id === activePicture.id;
            return (
              <button
                key={pic.id}
                onClick={() => onSelectPicture(pic)}
                className={`w-11 h-11 rounded-lg shrink-0 overflow-hidden border transition-all cursor-pointer relative group ${
                  isCurrent
                    ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                    : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                }`}
                title={`${pic.name} (#${idx + 1})`}
              >
                {pic.thumbnailUrl ?
                  <img 
                    src={pic.thumbnailUrl}
                    alt={pic.name}
                    className="w-full h-full object-cover"
                  />
                    : `#${idx + 1}` 
                } 
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Picture Information & Affine Equations */}
      <div className="p-3 bg-[#0d1322] border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div>
            <h4 className="text-xs font-semibold text-white truncate">
              {activePicture.name}
            </h4>
            <span className="text-[10px] text-slate-400">{activePicture.category}</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded">
            10,000 Pts
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          {activePicture.description}
        </p>

        {/* Affine Transformations Summary */}
        <div className="pt-1 space-y-1 text-[10px] font-mono">
          <div className="flex justify-between text-slate-400">
            <span>IFS Matrix Equations:</span>
            <span>{activePicture.transformations.length} Contractions</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {activePicture.transformations.map((t, idx) => (
              <div
                key={`t-${idx}`}
                className="flex items-center justify-between p-1 bg-[#090d16] border border-slate-800/60 rounded text-[9px] text-slate-300"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: `rgb(${Math.round(t.color[0] * 255)}, ${Math.round(
                        t.color[1] * 255
                      )}, ${Math.round(t.color[2] * 255)})`,
                    }}
                  />
                  <span>
                    W{idx + 1}: [{t.a.toFixed(2)}, {t.b.toFixed(2)}, {t.c.toFixed(2)},{' '}
                    {t.d.toFixed(2)}, {t.e.toFixed(2)}, {t.f.toFixed(2)}]
                  </span>
                </div>
                <span className="text-slate-500 tabular-nums">
                  p={(t.p * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Shader & Appearance Settings */}
      <div className="p-3 bg-[#0d1322] border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              Shader Appearance
            </span>
          </div>
        </div>

        {/* Point Geometry Shape */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400">Point Geometry</span>
          <div className="grid grid-cols-5 gap-1 p-0.5 bg-[#090d16] border border-slate-800 rounded-lg">
            {(
              [
                { id: 'circle', label: 'Circle' },
                { id: 'glow', label: 'Glow' },
                { id: 'disc', label: 'Disc' },
                { id: 'diamond', label: 'Diam.' },
                { id: 'ring', label: 'Ring' },
              ] as { id: PointShape; label: string }[]
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => onPointShapeChange(s.id)}
                className={`py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                  pointShape === s.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Mode */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400">Color Palette</span>
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { id: 'original', label: 'IFS System' },
                { id: 'turbo', label: 'Turbo' },
                { id: 'viridis', label: 'Viridis' },
                { id: 'plasma', label: 'Plasma' },
                { id: 'laser_cyan', label: 'Laser Cyan' },
                { id: 'cyber_amber', label: 'Cyber Amber' },
              ] as { id: ColorMapMode; label: string }[]
            ).map((c) => (
              <button
                key={c.id}
                onClick={() => onColorMapChange(c.id)}
                className={`py-1 px-1.5 text-[10px] font-medium rounded border transition-colors cursor-pointer ${
                  colorMapMode === c.id
                    ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-300'
                    : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blending Mode */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[11px] text-slate-400">Blend Mode</span>
          <div className="flex items-center gap-1 p-0.5 bg-[#090d16] border border-slate-800 rounded-md text-[10px]">
            <button
              onClick={() => onBlendModeChange('normal')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                blendMode === 'normal'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alpha
            </button>
            <button
              onClick={() => onBlendModeChange('additive')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                blendMode === 'additive'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Glow
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          {/* Point Size */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Point Caliber</span>
              <span className="text-slate-200">{pointSize.toFixed(1)} px</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="16.0"
              step="0.2"
              value={pointSize}
              onChange={(e) => onPointSizeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Opacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Global Opacity</span>
              <span className="text-slate-200">{(opacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Jitter */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Thermal Jitter</span>
              <span className="text-slate-200">{(jitter * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.02"
              value={jitter}
              onChange={(e) => onJitterChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* 5. Selection Statistics (if active) */}
      {selectionStats && (
        <div className="p-3 bg-cyan-950/30 border border-cyan-800/60 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
            <span>Box Selection</span>
            <div
              className="w-2.5 h-2.5 rounded-full border border-white/40"
              style={{ backgroundColor: selectionStats.dominantColor }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block">Selected:</span>
              <span className="text-cyan-300 tabular-nums">
                {selectionStats.count.toLocaleString()} pts
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Mean Pos:</span>
              <span className="tabular-nums">
                ({selectionStats.avgX}, {selectionStats.avgY})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function shuffled (arr: any[]): any[] {
    const shuffled = [];
    for (let i=0; i<arr.length; i++) {
        let j = Math.floor(Math.random() * arr.length);
        let temp = arr[i];
        shuffled[i] = arr[j];
        shuffled[j] = temp;
    }
    return shuffled;
  }


 
