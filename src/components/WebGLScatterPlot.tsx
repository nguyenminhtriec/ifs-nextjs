'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  ScatterPoint,
  ColorMapMode,
  PointShape,
  BlendMode,
  SelectionStats,
} from '../types';
import {
  VERTEX_SHADER_SOURCE,
  FRAGMENT_SHADER_SOURCE,
  createShader,
  createProgram,
} from '../utils/webglShaders';
import {
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Grid,
  Square,
  MousePointer,
  Download,
  Info,
  Layers,
} from 'lucide-react';

interface Props {
  currentPoints: ScatterPoint[];
  targetPoints: ScatterPoint[];
  morphProgress: number; // [0, 1]
  colorMapMode: ColorMapMode;
  pointShape: PointShape;
  blendMode: BlendMode;
  pointSize: number;
  opacity: number;
  jitter: number;
  onSelectionChange?: (stats: SelectionStats | null, selectedIds: number[]) => void;
  activePresetLabel: string;
}

export const WebGLScatterPlot: React.FC<Props> = ({
  currentPoints,
  targetPoints,
  morphProgress,
  colorMapMode,
  pointShape,
  blendMode,
  pointSize,
  opacity,
  jitter,
  onSelectionChange,
  activePresetLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgOverlayRef = useRef<SVGSVGElement>(null);

  // WebGL context and buffers reference
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const buffersRef = useRef<{
    posStart: WebGLBuffer | null;
    posEnd: WebGLBuffer | null;
    colorStart: WebGLBuffer | null;
    colorEnd: WebGLBuffer | null;
    size: WebGLBuffer | null;
    intensity: WebGLBuffer | null;
    index: WebGLBuffer | null;
  }>({
    posStart: null,
    posEnd: null,
    colorStart: null,
    colorEnd: null,
    size: null,
    intensity: null,
    index: null,
  });

  const animFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  // Dimensions & Margins
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const margin = { top: 32, right: 36, bottom: 48, left: 56 };

  // D3 Zoom Transform State
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Interactive modes & overlays
  const [interactionMode, setInteractionMode] = useState<'inspect' | 'select'>('inspect');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Selection box state
  const [selectionBox, setSelectionBox] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectedPointIds, setSelectedPointIds] = useState<number[]>([]);

  // FPS Telemetry
  const [fps, setFps] = useState<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  // Setup ResizeObserver for responsive canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute D3 Scales
  const { xScale, yScale, currentXScale, currentYScale } = useMemo(() => {
    const { width, height } = dimensions;
    const x = d3.scaleLinear().domain([-100, 100]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([-100, 100]).range([height - margin.bottom, margin.top]);

    const curX = zoomTransform.rescaleX(x);
    const curY = zoomTransform.rescaleY(y);

    return { xScale: x, yScale: y, currentXScale: curX, currentYScale: curY };
  }, [dimensions, margin.left, margin.right, margin.bottom, margin.top, zoomTransform]);

  // Spatial Quadtree for instant O(log N) hover queries on the 10,000 points
  const quadtree = useMemo(() => {
    // We query against current interpolated points
    const pts = currentPoints;
    return d3
      .quadtree<ScatterPoint>()
      .x((d) => d.x)
      .y((d) => d.y)
      .addAll(pts);
  }, [currentPoints]);

  // Initialize WebGL Context and compile shaders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      depth: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.error('WebGL is not supported on this browser.');
      return;
    }

    glRef.current = gl;

    const vShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vShader || !fShader) return;

    const program = createProgram(gl, vShader, fShader);
    if (!program) return;
    programRef.current = program;

    // Allocate vertex buffer objects (VBO)
    buffersRef.current = {
      posStart: gl.createBuffer(),
      posEnd: gl.createBuffer(),
      colorStart: gl.createBuffer(),
      colorEnd: gl.createBuffer(),
      size: gl.createBuffer(),
      intensity: gl.createBuffer(),
      index: gl.createBuffer(),
    };

    // Pre-populate index buffer (constant 0 to 9999)
    const indices = new Float32Array(10000);
    for (let i = 0; i < 10000; i++) indices[i] = i;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffersRef.current.index);
    gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return () => {
      if (program) gl.deleteProgram(program);
    };
  }, []);

  // Update WebGL Buffers when points change
  useEffect(() => {
    const gl = glRef.current;
    const buffers = buffersRef.current;
    if (!gl || !currentPoints.length || !targetPoints.length) return;

    const count = Math.min(currentPoints.length, targetPoints.length);

    // Positions Start
    const posStartData = new Float32Array(count * 2);
    const colorStartData = new Float32Array(count * 4);
    const sizeData = new Float32Array(count);
    // const intensityData = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const p = currentPoints[i];
      posStartData[i * 2] = p.x;
      posStartData[i * 2 + 1] = - p.y;
      colorStartData[i * 4] = parseInt(p.color.slice(1, 3), 16)/255;
      colorStartData[i * 4 + 1] = parseInt(p.color.slice(3, 5), 16)/255;
      colorStartData[i * 4 + 2] = parseInt(p.color.slice(5, 7), 16)/255;
      colorStartData[i * 4 + 3] = 0.92;
      sizeData[i] = p.size;
      // intensityData[i] = p.intensity;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.posStart);
    gl.bufferData(gl.ARRAY_BUFFER, posStartData, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorStart);
    gl.bufferData(gl.ARRAY_BUFFER, colorStartData, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.size);
    gl.bufferData(gl.ARRAY_BUFFER, sizeData, gl.DYNAMIC_DRAW);

    // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.intensity);
    // gl.bufferData(gl.ARRAY_BUFFER, intensityData, gl.DYNAMIC_DRAW);

    // Positions End
    const posEndData = new Float32Array(count * 2);
    const colorEndData = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      const p = targetPoints[i];
      posEndData[i * 2] = p.x;
      posEndData[i * 2 + 1] = - p.y;
      colorEndData[i * 4] = parseInt(p.color.slice(1, 3), 16)/255;
      colorEndData[i * 4 + 1] = parseInt(p.color.slice(3, 5), 16)/255;
      colorEndData[i * 4 + 2] = parseInt(p.color.slice(5, 7), 16)/255;
      colorEndData[i * 4 + 3] = 0.92;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.posEnd);
    gl.bufferData(gl.ARRAY_BUFFER, posEndData, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorEnd);
    gl.bufferData(gl.ARRAY_BUFFER, colorEndData, gl.DYNAMIC_DRAW);
  }, [currentPoints, targetPoints]);

  // Main High-Performance Render Loop
  const renderWebGL = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    const buffers = buffersRef.current;

    if (!gl || !program || !canvas) return;

    // Track FPS
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastFpsUpdateRef.current >= 600) {
      const delta = (now - lastFpsUpdateRef.current) / 1000;
      setFps(Math.round(frameCountRef.current / delta));
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;

    // Ensure physical canvas resolution matches device pixels
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear background
    gl.clearColor(0.04, 0.05, 0.09, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set Blending Mode (Additive for glowing scientific laser or Standard Alpha)
    gl.enable(gl.BLEND);
    if (blendMode === 'additive') {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    } else {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    gl.useProgram(program);

    // Calculate D3 scale to Screen pixel transform matrix
    // x_screen = xScale(x_data) = margin.left + ((x_data + 100)/200) * (W - margin.left - margin.right)
    // with zoom: x_screen = k * (x_base) + tx
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const sx = plotW / 200.0;
    const sy = -plotH / 200.0; // Cartesian flip: data Y goes up, screen Y goes down

    const ox = margin.left + 100.0 * sx;
    const oy = (height - margin.bottom) - 100.0 * (-sy);

    const k = zoomTransform.k;
    const tx = zoomTransform.x;
    const ty = zoomTransform.y;

    // Transform matrix for vertex shader (column-major 3x3 matrix)
    const m00 = k * sx * dpr;
    const m01 = 0;
    const m02 = 0;

    const m10 = 0;
    const m11 = k * sy * dpr;
    const m12 = 0;

    const m20 = (k * ox + tx) * dpr;
    const m21 = (k * oy + ty) * dpr;
    const m22 = 1.0;

    const transformMatrix = new Float32Array([
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22,
    ]);

    const uTransform = gl.getUniformLocation(program, 'u_transform');
    gl.uniformMatrix3fv(uTransform, false, transformMatrix);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(uResolution, width * dpr, height * dpr);

    const uMorphProgress = gl.getUniformLocation(program, 'u_morphProgress');
    gl.uniform1f(uMorphProgress, morphProgress);

    const uBasePointSize = gl.getUniformLocation(program, 'u_basePointSize');
    gl.uniform1f(uBasePointSize, pointSize * dpr);

    const uHoveredIndex = gl.getUniformLocation(program, 'u_hoveredIndex');
    gl.uniform1f(uHoveredIndex, hoveredPoint ? hoveredPoint.id : -1.0);

    const uJitter = gl.getUniformLocation(program, 'u_jitter');
    gl.uniform1f(uJitter, jitter);

    const uTime = gl.getUniformLocation(program, 'u_time');
    gl.uniform1f(uTime, (now - startTimeRef.current) * 0.001);

    // Fragment Shader Uniforms
    const colorMapModeInt = {
      original: 0,
      viridis: 1,
      plasma: 2,
      turbo: 3,
      spectral: 4,
      laser_cyan: 5,
      cyber_amber: 6,
    }[colorMapMode] ?? 0;

    const pointShapeInt = {
      circle: 0,
      glow: 1,
      disc: 2,
      diamond: 3,
      ring: 4,
    }[pointShape] ?? 0;

    const uColorMapMode = gl.getUniformLocation(program, 'u_colorMapMode');
    gl.uniform1i(uColorMapMode, colorMapModeInt);

    const uPointShape = gl.getUniformLocation(program, 'u_pointShape');
    gl.uniform1i(uPointShape, pointShapeInt);

    const uOpacity = gl.getUniformLocation(program, 'u_opacity');
    gl.uniform1f(uOpacity, opacity);

    const uDimUnselected = gl.getUniformLocation(program, 'u_dimUnselected');
    gl.uniform1f(uDimUnselected, selectedPointIds.length > 0 ? 1.0 : 0.0);

    // Bind Attributes
    const bindAttr = (buf: WebGLBuffer | null, name: string, size: number) => {
      if (!buf) return;
      const loc = gl.getAttribLocation(program, name);
      if (loc < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    bindAttr(buffers.posStart, 'a_posStart', 2);
    bindAttr(buffers.posEnd, 'a_posEnd', 2);
    bindAttr(buffers.colorStart, 'a_colorStart', 4);
    bindAttr(buffers.colorEnd, 'a_colorEnd', 4);
    bindAttr(buffers.size, 'a_size', 1);
    bindAttr(buffers.intensity, 'a_intensity', 1);
    bindAttr(buffers.index, 'a_index', 1);

    // Single instantaneous WebGL draw call: 10,000 points!
    const pointCount = Math.min(currentPoints.length, targetPoints.length);
    gl.drawArrays(gl.POINTS, 0, pointCount);
  }, [
    dimensions,
    blendMode,
    zoomTransform,
    margin.left,
    margin.right,
    margin.top,
    margin.bottom,
    morphProgress,
    pointSize,
    hoveredPoint,
    jitter,
    colorMapMode,
    pointShape,
    opacity,
    selectedPointIds.length,
    currentPoints.length,
    targetPoints.length,
  ]);

  // Request Animation Loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      renderWebGL();
      animFrameIdRef.current = requestAnimationFrame(loop);
    };
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [renderWebGL]);

  // Configure D3 Zoom Behavior on SVG
  useEffect(() => {
    const el = svgOverlayRef.current;
    if (!el) return;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 80])
      .extent([
        [margin.left, margin.top],
        [dimensions.width - margin.right, dimensions.height - margin.bottom],
      ])
      .filter((event) => {
        // Only zoom with wheel or when in inspect mode (not during box select)
        if (interactionMode === 'select' && event.type === 'mousedown') {
          return false;
        }
        return !event.ctrlKey && !event.button;
      })
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    (d3.select(el) as any).call(zoom);

    return () => {
      d3.select(el).on('.zoom', null);
    };
  }, [dimensions, margin.left, margin.top, margin.right, margin.bottom, interactionMode]);

  // Reset Zoom function
  const handleResetZoom = () => {
    if (!svgOverlayRef.current || !zoomBehaviorRef.current) return;
    (d3.select(svgOverlayRef.current) as any)
      .transition()
      .duration(450)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const handleZoomIn = () => {
    if (!svgOverlayRef.current || !zoomBehaviorRef.current) return;
    (d3.select(svgOverlayRef.current) as any)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.4);
  };

  const handleZoomOut = () => {
    if (!svgOverlayRef.current || !zoomBehaviorRef.current) return;
    (d3.select(svgOverlayRef.current) as any)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 0.7);
  };

  // Pointer interactions: Hover detection & Box Selection
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgOverlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setMousePos({ x: px, y: py });

    if (isSelecting && selectionBox) {
      setSelectionBox({
        ...selectionBox,
        x1: px,
        y1: py,
      });
      return;
    }

    if (interactionMode === 'inspect') {
      // Map screen pixel back to data space
      const dataX = currentXScale.invert(px);
      const dataY = currentYScale.invert(py);

      // Search radius in data coordinates
      const pixelRadius = 16;
      const dataRadius = Math.abs(currentXScale.invert(px + pixelRadius) - dataX);

      const found = quadtree.find(dataX, dataY, dataRadius);
      setHoveredPoint(found || null);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (interactionMode !== 'select') return;
    const rect = svgOverlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    setIsSelecting(true);
    setSelectionBox({
      x0: px,
      y0: py,
      x1: px,
      y1: py,
    });
  };

  const handlePointerUp = () => {
    if (!isSelecting || !selectionBox) return;
    setIsSelecting(false);

    // Compute selected bounds in data space
    const xMinPx = Math.min(selectionBox.x0, selectionBox.x1);
    const xMaxPx = Math.max(selectionBox.x0, selectionBox.x1);
    const yMinPx = Math.min(selectionBox.y0, selectionBox.y1);
    const yMaxPx = Math.max(selectionBox.y0, selectionBox.y1);

    // Check if it was just a tiny click
    if (Math.abs(xMaxPx - xMinPx) < 6 && Math.abs(yMaxPx - yMinPx) < 6) {
      setSelectionBox(null);
      setSelectedPointIds([]);
      onSelectionChange?.(null, []);
      return;
    }

    const dataX0 = currentXScale.invert(xMinPx);
    const dataX1 = currentXScale.invert(xMaxPx);
    // Remember Y scale is inverted in screen space
    const dataY1 = currentYScale.invert(yMinPx);
    const dataY0 = currentYScale.invert(yMaxPx);

    const minX = Math.min(dataX0, dataX1);
    const maxX = Math.max(dataX0, dataX1);
    const minY = Math.min(dataY0, dataY1);
    const maxY = Math.max(dataY0, dataY1);

    const selected: ScatterPoint[] = [];
    const selectedIds: number[] = [];
    let sumX = 0;
    let sumY = 0;
    let sumIntensity = 0;

    for (let i = 0; i < currentPoints.length; i++) {
      const p = currentPoints[i];
      if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
        selected.push(p);
        selectedIds.push(p.id);
        sumX += p.x;
        sumY += p.y;
        // sumIntensity += p.intensity;
      }
    }

    setSelectedPointIds(selectedIds);

    if (selected.length > 0) {
      const avgX = sumX / selected.length;
      const avgY = sumY / selected.length;
      const avgIntensity = sumIntensity / selected.length;

      // Sample dominant RGB
      const midPoint = selected[Math.floor(selected.length / 2)];
      const dominantColor = midPoint.color;

      const stats: SelectionStats = {
        count: selected.length,
        avgX: Number(avgX.toFixed(2)),
        avgY: Number(avgY.toFixed(2)),
        avgIntensity: Number(avgIntensity.toFixed(3)),
        dominantColor,
      };
      onSelectionChange?.(stats, selectedIds);
    } else {
      onSelectionChange?.(null, []);
    }
  };

  const handleClearSelection = () => {
    setSelectionBox(null);
    setSelectedPointIds([]);
    onSelectionChange?.(null, []);
  };

  // Render D3 Axes and Grid lines in SVG
  const xTicks = currentXScale.ticks(10);
  const yTicks = currentYScale.ticks(8);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-120 bg-[#070a12] overflow-hidden select-none"
    >
      {/* Underlying High-Performance WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
        className="absolute inset-0 block cursor-crosshair"
      />

      {/* Synchronized D3 SVG Layer (Axes, Grid, Crosshairs, Selection Box) */}
      <svg
        ref={svgOverlayRef}
        width={dimensions.width}
        height={dimensions.height}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHoveredPoint(null);
          setMousePos(null);
        }}
        className={`absolute inset-0 pointer-events-auto ${
          interactionMode === 'select' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        <defs>
          <clipPath id="chart-clip">
            <rect
              x={margin.left}
              y={margin.top}
              width={Math.max(0, dimensions.width - margin.left - margin.right)}
              height={Math.max(0, dimensions.height - margin.top - margin.bottom)}
            />
          </clipPath>
        </defs>

        {/* Dynamic D3 Grid Lines */}
        {showGrid && (
          <g clipPath="url(#chart-clip)" className="opacity-40">
            {xTicks.map((tickVal) => {
              const xPos = currentXScale(tickVal);
              return (
                <line
                  key={`x-grid-${tickVal}`}
                  x1={xPos}
                  x2={xPos}
                  y1={margin.top}
                  y2={dimensions.height - margin.bottom}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
              );
            })}
            {yTicks.map((tickVal) => {
              const yPos = currentYScale(tickVal);
              return (
                <line
                  key={`y-grid-${tickVal}`}
                  x1={margin.left}
                  x2={dimensions.width - margin.right}
                  y1={yPos}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
              );
            })}
          </g>
        )}

        {/* D3 Coordinate Center Crosshairs (0, 0) */}
        <g clipPath="url(#chart-clip)" className="opacity-70">
          <line
            x1={currentXScale(0)}
            x2={currentXScale(0)}
            y1={margin.top}
            y2={dimensions.height - margin.bottom}
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <line
            x1={margin.left}
            x2={dimensions.width - margin.right}
            y1={currentYScale(0)}
            y2={currentYScale(0)}
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </g>

        {/* Live Mouse Crosshairs */}
        {showCrosshair && mousePos && (
          <g clipPath="url(#chart-clip)" className="pointer-events-none opacity-30">
            <line
              x1={mousePos.x}
              x2={mousePos.x}
              y1={margin.top}
              y2={dimensions.height - margin.bottom}
              stroke="#f8fafc"
              strokeWidth="0.75"
            />
            <line
              x1={margin.left}
              x2={dimensions.width - margin.right}
              y1={mousePos.y}
              y2={mousePos.y}
              stroke="#f8fafc"
              strokeWidth="0.75"
            />
          </g>
        )}

        {/* D3 Calibrated X-Axis */}
        <g className="font-mono text-[10px] tabular-nums select-none">
          <line
            x1={margin.left}
            x2={dimensions.width - margin.right}
            y1={dimensions.height - margin.bottom}
            y2={dimensions.height - margin.bottom}
            stroke="#334155"
            strokeWidth="1"
          />
          {xTicks.map((val) => {
            const x = currentXScale(val);
            if (x < margin.left || x > dimensions.width - margin.right) return null;
            return (
              <g key={`xtick-${val}`} transform={`translate(${x}, ${dimensions.height - margin.bottom})`}>
                <line y2="5" stroke="#475569" strokeWidth="1" />
                <text
                  y="16"
                  textAnchor="middle"
                  fill="#94a3b8"
                  className="font-mono text-[10px]"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}
        </g>

        {/* D3 Calibrated Y-Axis */}
        <g className="font-mono text-[10px] tabular-nums select-none">
          <line
            x1={margin.left}
            x2={margin.left}
            y1={margin.top}
            y2={dimensions.height - margin.bottom}
            stroke="#334155"
            strokeWidth="1"
          />
          {yTicks.map((val) => {
            const y = currentYScale(val);
            if (y < margin.top || y > dimensions.height - margin.bottom) return null;
            return (
              <g key={`ytick-${val}`} transform={`translate(${margin.left}, ${y})`}>
                <line x2="-5" stroke="#475569" strokeWidth="1" />
                <text
                  x="-8"
                  dy="3"
                  textAnchor="end"
                  fill="#94a3b8"
                  className="font-mono text-[10px]"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}
        </g>

        {/* Interactive Selection Box / Lasso */}
        {selectionBox && (
          <rect
            x={Math.min(selectionBox.x0, selectionBox.x1)}
            y={Math.min(selectionBox.y0, selectionBox.y1)}
            width={Math.abs(selectionBox.x1 - selectionBox.x0)}
            height={Math.abs(selectionBox.y1 - selectionBox.y0)}
            fill="rgba(14, 165, 233, 0.15)"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeDasharray="4,2"
            className="pointer-events-none"
          />
        )}

        {/* Hover Indicator Target Reticle */}
        {hoveredPoint && (
          <g
            transform={`translate(${currentXScale(hoveredPoint.x)}, ${currentYScale(hoveredPoint.y)})`}
            className="pointer-events-none"
          >
            <circle
              r="14"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              className="animate-ping opacity-75"
            />
            <circle
              r="7"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Floating HUD Controls Ribbon (Top-Right of Viewport) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-[#0b101d]/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl">
        <button
          onClick={() => setInteractionMode('inspect')}
          title="Inspect & Hover Mode"
          className={`p-2 rounded-md transition-colors ${
            interactionMode === 'inspect'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          onClick={() => setInteractionMode('select')}
          title="Box Selection Tool"
          className={`p-2 rounded-md transition-colors ${
            interactionMode === 'select'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Square className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 my-auto mx-0.5" />

        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Coordinate Grid"
          className={`p-2 rounded-md transition-colors ${
            showGrid ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowCrosshair(!showCrosshair)}
          title="Toggle Crosshair Probes"
          className={`p-2 rounded-md transition-colors ${
            showCrosshair ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 my-auto mx-0.5" />

        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetZoom}
          title="Reset View (1:1)"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Status / Point Information HUD (Top-Left of Viewport) */}
      <div className="absolute top-4 left-16 z-20 flex items-center gap-3">
        <div className="px-3 py-1.5 bg-[#0b101d]/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-lg flex items-center gap-2.5 text-xs">
          <span className="font-semibold text-slate-200">{activePresetLabel}</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-cyan-400 font-medium">10,000 Points</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-400">{zoomTransform.k.toFixed(1)}x Zoom</span>
          <span className="text-slate-600">·</span>
          {/* <span className="font-mono tabular-nums text-emerald-400">{fps} FPS</span> */}
        </div>

        {selectedPointIds.length > 0 && (
          <div className="px-3 py-1.5 bg-cyan-950/80 border border-cyan-800/60 rounded-lg shadow-lg flex items-center gap-2 text-xs">
            <span className="text-cyan-300 font-mono tabular-nums">
              {selectedPointIds.length.toLocaleString()} points selected
            </span>
            <button
              onClick={handleClearSelection}
              className="text-cyan-400 hover:text-white font-medium ml-1 underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Hover Tooltip HUD */}
      {hoveredPoint && (
        <div
          className="absolute z-30 pointer-events-none transition-transform duration-75"
          style={{
            left: `${Math.min(
              dimensions.width - 240,
              Math.max(margin.left + 10, currentXScale(hoveredPoint.x) + 16)
            )}px`,
            top: `${Math.min(
              dimensions.height - 180,
              Math.max(margin.top + 10, currentYScale(hoveredPoint.y) - 30)
            )}px`,
          }}
        >
          <div className="w-56 p-3 bg-[#0d1322]/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl text-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-mono text-cyan-400 font-semibold">
                Point #{hoveredPoint.id.toString().padStart(5, '0')}
              </span>
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                style={{
                  backgroundColor: hoveredPoint.color,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">Coord X: </span>
                <span className="tabular-nums font-medium text-slate-200">
                  {hoveredPoint.x.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Coord Y: </span>
                <span className="tabular-nums font-medium text-slate-200">
                  {hoveredPoint.y.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coordinate & Cursor HUD in Bottom-Right */}
      <div className="absolute bottom-2 right-4 z-10 flex items-center gap-3 text-[11px] font-mono text-slate-500">
        {mousePos && (
          <span>
            Pointer: ({currentXScale.invert(mousePos.x).toFixed(1)},{' '}
            {currentYScale.invert(mousePos.y).toFixed(1)})
          </span>
        )}
        <span>WebGL2 Shader Pipeline</span>
      </div>
    </div>
  );
};
