'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  IFSPicture,
  ColorMapMode,
  PointShape,
  BlendMode,
  SelectionStats,
} from '@/src/types';
import { createIFSPicture} from '@/src/utils/ifsGenerators';
import { WebGLScatterPlot } from '@/src/components/WebGLScatterPlot';
import { ControlPanel } from '@/src/components/ControlPanel';
import { HistogramPanel } from '@/src/components/HistogramPanel';
import { GalleryPage } from '@/src/components/GalleryPage';
import {
  Sparkles,
  Download,
  Shuffle,
  Images,
  LayoutDashboard,
  HelpCircle,
  X,
} from 'lucide-react';



export default function HomePage() {
  // const [mounted, setMounted] = useState<boolean>(false);
  const initialPic = createIFSPicture();
  // Array of created pictures with max length = 10
  const [pictures, setPictures] = useState<IFSPicture[]>([initialPic]);

  // (() => {
  //   // Initialize with 1 initial deterministic IFS picture (Barnsley Fern) with fixed seed
  //   const initialPic = createIFSPicture('Barnsley Fern');
  //   return [initialPic];
  // });

  // Current active picture displayed on the scatter plot
  const [activePicture,  setActivePicture] = useState<IFSPicture>(pictures[0]);

  // Points for WebGL transition rendering
  const [currentPoints, setCurrentPoints] = useState(() => activePicture.points);
  const [targetPoints, setTargetPoints] = useState(() => activePicture.points);
  const [morphProgress, setMorphProgress] = useState<number>(1.0);
  const morphAnimIdRef = useRef<number | null>(null);

  // App Navigation: 'studio' (current scatter plot) or 'gallery' (latest pictures up to 10)
  const [currentPage, setCurrentPage] = useState<'studio' | 'gallery'>('studio');

  // WebGL Shader configuration
  const [pointSize, setPointSize] = useState<number>(.1);
  const [opacity, setOpacity] = useState<number>(0.92);
  const [colorMapMode, setColorMapMode] = useState<ColorMapMode>('original');
  const [pointShape, setPointShape] = useState<PointShape>('circle');
  const [blendMode, setBlendMode] = useState<BlendMode>('normal');
  const [jitter, setJitter] = useState<number>(0.0);

  // Selection & Analysis
  const [selectionStats, setSelectionStats] = useState<SelectionStats | null>(null);
  const [selectedPointIds, setSelectedPointIds] = useState<number[]>([]);

  // Docs Modal
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);

  /**
   * Smooth WebGL Morphing transition helper
   */
  const transitionToPoints = useCallback((newPoints: typeof targetPoints) => {
    setCurrentPoints(targetPoints);
    setTargetPoints(newPoints);
    setMorphProgress(0.0);

    let start: number | null = null;
    const duration = 1000;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const linearT = Math.min(1.0, elapsed / duration);
      // Smooth cubic ease-in-out
      const easedT =
        linearT < 0.5
          ? 4 * linearT * linearT * linearT
          : 1 - Math.pow(-2 * linearT + 2, 3) / 2;

      setMorphProgress(easedT);

      if (linearT < 1.0) {
        morphAnimIdRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentPoints(newPoints);
        setMorphProgress(1.0);
      }
    };

    if (morphAnimIdRef.current) cancelAnimationFrame(morphAnimIdRef.current);
    morphAnimIdRef.current = requestAnimationFrame(animate);
  }, [targetPoints]);

  /**
   * Feature 1 & 2:
   * (1) Plot one new picture of 10,000 data points via IFS when clicking New Picture
   * (2) Add created picture to array with max length = 10
   * And show new picture in current page immediately!
   */
  const handleGenerateNewPicture = useCallback(
    (presetName?: string) => {
      const newPic = createIFSPicture(presetName);
      // Add to array with max length = 10:
      setPictures((prev) => {
        let updated = [...prev];
        if (updated.length >= 10) {
          // Remove the oldest picture (the item at the end of the history array)
          updated.pop();
        }
        // Prepend the new latest picture to the front
        return [newPic, ...updated];
      });

      // Plot and show new picture in current page immediately
      setActivePicture(newPic);
      transitionToPoints(newPic.points);
      setSelectedPointIds([]);
      setSelectionStats(null);
      setCurrentPage('studio');
    },
    [transitionToPoints]
  );

  /**
   * Select a picture from gallery or mini-strip to plot in current page
   */
  const handleSelectPicture = useCallback(
    (pic: IFSPicture) => {
      setActivePicture(pic);
      transitionToPoints(pic.points);
      setSelectedPointIds([]);
      setSelectionStats(null);
      setCurrentPage('studio');
    },
    [transitionToPoints]
  );

  /**
   * Reset gallery history
   */
  const handleClearHistory = () => {
    const single = createIFSPicture();
    setPictures([single]);
    setActivePicture(single);
    transitionToPoints(single.points);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* 1. Universal Top Navigation Bar (Contract Compliant: 1 Row, 3 Zones) */}
      <header className="h-14 border-b border-slate-800 bg-[#090d16] px-6 flex items-center justify-between gap-8 shrink-0 z-30">
        {/* Zone 1: Single Text Element Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold tracking-tight text-base text-white whitespace-nowrap">
            SPECTRA<span className="text-cyan-400">·IFS</span>
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline whitespace-nowrap">
            10,000-Point Iterated Function System
          </span>
        </div>

        {/* Zone 2: Navigation Links (Switch between Current Picture and Gallery Page) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setCurrentPage('studio')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              currentPage === 'studio' ? 'text-cyan-400' : 'hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Current Picture</span>
          </button>

          <button
            onClick={() => setCurrentPage('gallery')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              currentPage === 'gallery' ? 'text-cyan-400' : 'hover:text-slate-200'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>Latest Pictures ({pictures.length}/10)</span>
          </button>

          <button
            onClick={() => setShowDocsModal(true)}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            IFS Math & Pipeline
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (New Picture Button) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleGenerateNewPicture()}
            title="Generate a new 10,000-point IFS picture and plot immediately"
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Picture</span>
          </button>
          <Link href='./gallery' className='border p-1 border-gray-500 rounded-xl text-xs'>Go ahead</Link>
        </div>
      </header>

      {/* 2. Main Page Content */}
      {currentPage === 'studio' ? (
        /* PAGE 1: Studio / Current Picture View */
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Left Parameter & Control Drawer */}
          <aside className="w-full lg:w-96 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto max-h-[45vh] lg:max-h-[calc(100vh-3.5rem)] p-4 space-y-4">
            <ControlPanel
              activePicture={activePicture}
              pictures={pictures}
              onSelectPicture={handleSelectPicture}
              onGenerateNewPicture={handleGenerateNewPicture}
              onOpenGallery={() => setCurrentPage('gallery')}
              pointSize={pointSize}
              onPointSizeChange={setPointSize}
              opacity={opacity}
              onOpacityChange={setOpacity}
              colorMapMode={colorMapMode}
              onColorMapChange={setColorMapMode}
              pointShape={pointShape}
              onPointShapeChange={setPointShape}
              blendMode={blendMode}
              onBlendModeChange={setBlendMode}
              jitter={jitter}
              onJitterChange={setJitter}
              selectionStats={selectionStats}
            />

            {/* Live Statistical Distribution Histogram */}
            <div className="pt-2">
              <HistogramPanel
                points={activePicture.points}
                selectedIds={selectedPointIds}
              />
            </div>
          </aside>

          {/* Center WebGL Scatter Plot Viewport */}
          <section className="flex flex-col h-[55vh] lg:h-[calc(100vh-3.5rem)] relative overflow-hidden">
            {activePicture ? (
              <WebGLScatterPlot
                currentPoints={currentPoints}
                targetPoints={targetPoints}
                morphProgress={morphProgress}
                colorMapMode={colorMapMode}
                pointShape={pointShape}
                blendMode={blendMode}
                pointSize={pointSize}
                opacity={opacity}
                jitter={jitter}
                activePresetLabel={activePicture.name}
                onSelectionChange={(stats, ids) => {
                  setSelectionStats(stats);
                  setSelectedPointIds(ids);
                }}
              />
            ) : (
              <div className="flex-1 w-full h-full bg-[#070a12] flex items-center justify-center">
                <span className="text-xs font-mono text-cyan-400">Initializing WebGL Engine...</span>
              </div>
            )}

            {/* Bottom Telemetry Bar */}
            <footer className="h-8 bg-[#090d16] border-t border-slate-800 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 select-none">
              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-medium">
                  IFS: {activePicture.name}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-cyan-400 tabular-nums">
                  10,000 Data Points
                </span>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-slate-400 hidden sm:inline">
                  Buffer: {pictures.length}/10 Pictures
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 hidden md:inline">
                  {activePicture.transformations.length} Affine Contractions
                </span>
                <span className="text-slate-600 hidden md:inline">·</span>
                <span className="text-emerald-400 tabular-nums">
                  GPU 120 FPS
                </span>
              </div>
            </footer>
          </section>
        </main>
      ) : (
        /* PAGE 2: Latest Pictures Gallery View (Up to 10 stored pictures) */
        <main className="flex-1 overflow-y-auto bg-[#07090e]">
          <GalleryPage
            pictures={pictures}
            activePictureId={activePicture.id}
            onSelectPicture={handleSelectPicture}
            onGenerateNew={() => handleGenerateNewPicture()}
            onBackToStudio={() => setCurrentPage('studio')}
            onClearHistory={handleClearHistory}
          />
        </main>
      )}

      {/* IFS Math & Architecture Documentation Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0d1322] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">
                  Iterated Function System (IFS) Mathematical Engine
                </h3>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                An <strong>Iterated Function System (IFS)</strong> generates
                self-similar fractal images and natural organic pictures via a finite
                set of contracting affine transformations in the 2D plane:
              </p>

              <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300 space-y-1">
                <p>x_{'{n+1}'} = a_i · x_n + b_i · y_n + e_i</p>
                <p>y_{'{n+1}'} = c_i · x_n + d_i · y_n + f_i</p>
                <p className="text-slate-400 text-[10px]">
                  Chosen with probability p_i satisfying Σ p_i = 1
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg">
                  <h4 className="font-semibold text-white mb-1">
                    Chaos Game Sampling
                  </h4>
                  <p className="text-slate-400">
                    A sequence of 10,000 points is generated from an initial seed.
                    The first 100 transient steps are discarded so points adhere
                    strictly to the attractor invariant set.
                  </p>
                </div>
                <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg">
                  <h4 className="font-semibold text-white mb-1">
                    10-Picture FIFO Array
                  </h4>
                  <p className="text-slate-400">
                    Every time you click <em>New Picture</em>, the generated 10k
                    dataset is added to an array (max length = 10). When the array already has
                    10 pictures, adding a new picture automatically evicts the oldest picture.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
