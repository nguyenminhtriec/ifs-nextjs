

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { IFSPicture } from '../types';
import {
  ArrowLeft,
  Sparkles,
  Download,
  FileCode,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';

interface Props {
  pictures: IFSPicture[];
  activePictureId: string;
  onSelectPicture: (picture: IFSPicture) => void;
  onGenerateNew: () => void;
  onBackToStudio: () => void;
  onClearHistory: () => void;
}

export const GalleryPage: React.FC<Props> = ({
  pictures,
  activePictureId,
  onSelectPicture,
  onGenerateNew,
  onBackToStudio,
  onClearHistory,
}) => {
  const exportPictureCSV = (pic: IFSPicture) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'id,x,y,r,g,b,a,size,intensity,cluster,label\n';

    pic.points.forEach((p) => {
      csvContent += `${p.id},${p.x},${p.y},${p.r.toFixed(3)},${p.g.toFixed(3)},${p.b.toFixed(
        3
      )},${p.a.toFixed(2)},${p.size.toFixed(2)},${p.intensity.toFixed(4)},${p.cluster},"${
        p.label ?? ''
      }"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${pic.name.toLowerCase().replace(/\s+/g, '_')}_10k_points.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPictureJSON = (pic: IFSPicture) => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pic, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${pic.name.toLowerCase().replace(/\s+/g, '_')}_10k_points.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStudio}
              className="p-1.5 bg-[#0d1322] hover:bg-slate-800 border border-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to Scatter Plot"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white">
              IFS Picture Archive
            </h1>
            <span className="text-xs font-mono text-cyan-400 font-medium">
              ({pictures.length} of 10 Stored)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Array of up to 10 latest Iterated Function System pictures (10,000 data points each). When capacity reaches 10, adding a new picture automatically drops the oldest one.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pictures.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset History</span>
            </button>
          )}

          <button
            onClick={onGenerateNew}
            className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New IFS Picture</span>
          </button>
        </div>
      </div>

      {/* Picture Gallery Grid */}
      {pictures.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-slate-800 rounded-xl bg-[#090d16] space-y-3">
          <p className="text-sm text-slate-400">No IFS pictures created yet.</p>
          <button
            onClick={onGenerateNew}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate First Picture (10,000 Points)</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {pictures.map((pic, index) => {
            const isActive = pic.id === activePictureId;
            const dateObj = new Date(pic.createdAt);
            const dateStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj
              .getMinutes()
              .toString()
              .padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;

            return (
              <div
                key={pic.id}
                className={`flex flex-col bg-[#0d1322] border rounded-xl overflow-hidden transition-all duration-200 ${
                  isActive
                    ? 'border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail Display with Hover Overlay */}
                <div className="relative aspect-square w-full bg-[#060911] overflow-hidden group">
                  {pic.thumbnailUrl ? (
                    <img
                      src={pic.thumbnailUrl}
                      alt={pic.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                      10,000 pts
                    </div>
                  )}

                  {/* Slot Number Label */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded text-[10px] font-mono text-slate-300 border border-white/10">
                    Slot #{index + 1}
                  </div>

                  {isActive && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500/90 text-white rounded text-[10px] font-medium font-mono">
                      Active
                    </div>
                  )}

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                    <button
                      onClick={() => onSelectPicture(pic)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Plot</span>
                    </button>
                  </div>
                </div>

                {/* Picture Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                        {pic.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {pic.description}
                    </p>
                  </div>

                  {/* Metadata: Transforms & Color Palette */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{pic.transformations.length} Affine Maps</span>
                      <span className="text-cyan-400 tabular-nums">10,000 Pts</span>
                    </div>

                    {/* Transform Color Swatches */}
                    <div className="flex items-center gap-1">
                      {pic.transformations.map((t, tidx) => (
                        <div
                          key={`swatch-${pic.id}-${tidx}`}
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{
                            backgroundColor: `rgb(${Math.round(t.color[0] * 255)}, ${Math.round(
                              t.color[1] * 255
                            )}, ${Math.round(t.color[2] * 255)})`,
                          }}
                          title={`Transform T${tidx + 1} (p=${(t.p * 100).toFixed(1)}%)`}
                        />
                      ))}
                    </div>

                    {/* Footer Export & View Buttons */}
                    <div className="pt-1 flex items-center justify-between gap-1">
                      <button
                        onClick={() => onSelectPicture(pic)}
                        className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Plot</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => exportPictureCSV(pic)}
                        title="Download CSV"
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => exportPictureJSON(pic)}
                        title="Download JSON"
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
