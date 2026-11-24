'use client';

import { useRouter } from 'next/navigation';    
import { useEffect, useState } from 'react';
import { usePictureContext } from '@/src/utils/pictureContext';
import { ScatterPlotly } from '@/src/components/ScatterPlotly';
import { ScatterPoint } from '@/src/types';

// create a hero page that displays the picture whose id is {id} of the gallery item
export default function HeroPage() { 
  const { selectedPicture } = usePictureContext();
  const router = useRouter();
  const [plainColor, setPlainColor] = useState<string | null>(null);

  const points = selectedPicture?.points || [];

  const plainColors = {
    red: "#FF4444", green: "#00FF00", blue: "#4444FF",
    yellow: "#FFFF00", cyan: "#00FFFF", magenta: "#FF00FF", 
    deeppink: "#FF1493", pink: "#ffc0cb", sky: "#38bdf8", teal: "#00aa88"};

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] w-auto py-2">
        <h1 className="text-3xl font-bold">Hero Page</h1>
        <div className="mt-4 flex flex-col items-center">
            <p className="text-lg">Displaying image with ID: {selectedPicture?.id}</p>
            <p>{selectedPicture?.name}</p>
        </div>
        <div
            className="flex mt-4 w-600px h-600px max-w-2/3 border border-gray-600"
        >
            {/* <ScatterPlotly points={points} plainColor={plainColor} /> */}
            <img
                src={createCanvasPicture(points, plainColor)}
                alt="Scatter Plot"
                className="w-full h-auto border border-gray-600"
            />

        </div>
        <div className='flex flex-wrap justify-center mt-4'>
          {Object.entries(plainColors).map(([name, val]) => (
            <button
                key={name}
                onClick={() => setPlainColor(val)}
                className={`mt-4 px-4 py-2 text-white rounded-full hover:opacity-90` }
                style ={{ backgroundColor: val }} 
                
            >
                {name}
            </button>
          ))}
          <button
                onClick={() => setPlainColor(null)}
                className={`mt-4 px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600`}
            >
                Reset Color
            </button>
        </div>
      
        <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Back to Gallery
        </button>
    </div> 
  ) 
}


function createCanvasPicture(points: ScatterPoint[], plainColor: string | null): string {
  'use client';  
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#161a1f'; //'#282a3c' //'#060911';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw points
  for (let i = 0; i < points.length; i ++) {
    const p = points[i];
    //Map [-100, 100] to [20, 380]
    const px = 200 + (p.x / 100) * 180;
    const py = 200 - (p.y / 100) * 180;

    if (plainColor) ctx.fillStyle = plainColor
    else {
      ctx.fillStyle = p.color;
    }  
    ctx.fillRect(px, py, 0.5, 0.5);
  }
  return canvas.toDataURL('image/png');
}

   
