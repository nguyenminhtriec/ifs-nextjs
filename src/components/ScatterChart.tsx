
"use client"; // Required for Next.js App Router

import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

// 1. Register the required components for a scatter plot
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

// 2. Define your chart configurations
export const options: ChartOptions<"scatter"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      type: "linear", // Scatter plots require a linear x-axis
      position: "bottom",
      title: {
        display: true,
        text: "X Axis Label",
      },
    },
    y: {
      title: {
        display: true,
        text: "Y Axis Label",
      },
    },
  },
};

// 3. Populate your coordinate datasets [{x, y}]

export function ScatterChart({data}: { data: ChartData<"scatter"> }) {
  return (
    <div className="w-full h-full border border-gray-600 p-4">
      <Scatter options={options} data={data} />
    </div>
  );
}
