
'use client';

import dynamic from "next/dynamic";
import { ScatterPoint } from "@/src/types"; 

const Plot = dynamic(() => import('react-plotly.js'), { 
    ssr: false,
    loading: () => <p>Loading...</p>
});

export function ScatterPlotly({points, plainColor}: {points: ScatterPoint[], plainColor?: string | null}) {
    const X = points.map(point => point.x) || [];
    const Y = points.map(point => point.y) || [];
    const color = !plainColor ? points.map(point => `rgba(
        ${Math.round(point.r * 255)}, 
        ${Math.round(point.g * 255)}, 
        ${Math.round(point.b * 255)}, 
        ${point.a})`
    ) || [] : plainColor;

    return (
        <Plot
            data={
                [
                    {
                        x: X,
                        y: Y,
                        type: 'scatter',
                        mode: 'markers',
                        marker: { color: color, size: .5 },
                    },
                ]
            }
            layout={
                {
                    // title: 'Scatter Plot',
                    // title: {
                    //     text: 'Scatter Plot',
                    //     font: { color: '#acf' }
                    // },
                    // 1) Set background colors (e.g., matching gray themes)
                    paper_bgcolor: '#232426', // Outermost wrapper background (Tailwind gray-100)
                    paper_pad: 8, // Padding around the entire plot (Tailwind gray-100)
                    plot_bgcolor: '#1e293b',  // Grid/plotting area background (Tailwind gray-200)
                    plot_bordercolor: '#282a3c', // Border color of the plotting area (Tailwind gray-200)
                    margin: { t: 16, b: 16, l: 16, r: 16 }, // Margin around the plot area

                    
                    // 2) Completely hide the two axes (lines, labels, grids, and ticks)
                    xaxis: {
                        visible: true,    // Hides the entire axis line, labels, and ticks
                        showgrid: false,   // Prevents grid lines from showing
                        zeroline: false    // Prevents the central (0,0) line from showing
                    },
                    yaxis: {
                        visible: true,    // Hides the entire axis line, labels, and ticks
                        showgrid: false,   // Prevents grid lines from showing
                        zeroline: false    // Prevents the central (0,0) line from showing
                    },
                }
            }
            config= {
                {
                    responsive: true,
                    useResizeHandler: true,
                    
                }
            }
            style={{ width: 500, height: 500, minWidth: 300, minHeight: 300 }}
        />
    );
}
