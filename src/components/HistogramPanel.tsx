'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ScatterPoint } from '../types';
import * as d3 from 'd3';

interface Props {
  points: ScatterPoint[];
  selectedIds?: number[];
}

export const HistogramPanel: React.FC<Props> = ({ points, selectedIds }) => {
  const [metric, setMetric] = useState<'intensity' | 'x' | 'y'>('intensity');

  // Compute distribution bins using D3
  const { bins, minVal, maxVal, meanVal, stdVal } = useMemo(() => {
    if (!points.length) {
      return { bins: [], minVal: 0, maxVal: 0, meanVal: 0, stdVal: 0 };
    }

    const values = points.map((p) => {
      if (metric === 'x') return p.x;
      if (metric === 'y') return p.y;
      return p.intensity;
    });

    const min = d3.min(values) ?? 0;
    const max = d3.max(values) ?? 1;
    const mean = d3.mean(values) ?? 0;
    const deviation = d3.deviation(values) ?? 0;

    const binGenerator = d3
      .bin()
      .domain([min, max])
      .thresholds(24);

    const computedBins = binGenerator(values);

    return {
      bins: computedBins,
      minVal: min,
      maxVal: max,
      meanVal: mean,
      stdVal: deviation,
    };
  }, [points, metric]);

  const maxBinCount = useMemo(() => {
    return d3.max(bins, (b) => b.length) || 1;
  }, [bins]);

  const chartHeight = 64;
  const chartWidth = 280;

  return (
    <div className="p-4 bg-[#0d1322] border border-slate-800 rounded-lg space-y-3">
      {/* Header with Metric Selector */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">Point Distribution</span>
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-md text-[11px]">
          <button
            onClick={() => setMetric('intensity')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              metric === 'intensity'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Luminance
          </button>
          <button
            onClick={() => setMetric('x')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              metric === 'x'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            X-Axis
          </button>
          <button
            onClick={() => setMetric('y')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              metric === 'y'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Y-Axis
          </button>
        </div>
      </div>

      {/* SVG Bar Histogram */}
      <div className="w-full h-16 relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
        >
          {bins.map((bin, i) => {
            const barWidth = chartWidth / bins.length - 1.5;
            const barHeight = (bin.length / maxBinCount) * (chartHeight - 8);
            const x = i * (chartWidth / bins.length);
            const y = chartHeight - barHeight;

            return (
              <g key={`bin-${i}`}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(2, barWidth)}
                  height={Math.max(1, barHeight)}
                  rx="1"
                  className="fill-cyan-500/70 hover:fill-cyan-400 transition-colors"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tabular Statistical Metrics */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono">
        <div>
          <span className="block text-slate-500 text-[10px]">MIN</span>
          <span className="text-slate-300 tabular-nums">
            {metric === 'intensity' ? `${(minVal * 100).toFixed(0)}%` : minVal.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="block text-slate-500 text-[10px]">MAX</span>
          <span className="text-slate-300 tabular-nums">
            {metric === 'intensity' ? `${(maxVal * 100).toFixed(0)}%` : maxVal.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="block text-slate-500 text-[10px]">MEAN</span>
          <span className="text-cyan-400 tabular-nums">
            {metric === 'intensity' ? `${(meanVal * 100).toFixed(0)}%` : meanVal.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="block text-slate-500 text-[10px]">STD DEV</span>
          <span className="text-slate-300 tabular-nums">{stdVal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
