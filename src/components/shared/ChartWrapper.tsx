"use client"

import * as React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import { cn } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

ChartJS.defaults.font.family = 'var(--font-inter), sans-serif';
ChartJS.defaults.color = '#737686';

const defaultOptions: ChartOptions<"line" | "bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#F1F5F9',
        drawTicks: false,
      },
      border: {
        display: false
      }
    },
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false
      }
    },
  },
}

export function ChartWrapper({
  type = "line",
  data,
  options,
  className
}: {
  type?: "line" | "bar";
  data: ChartData<"line" | "bar">;
  options?: ChartOptions<"line" | "bar">;
  className?: string;
}) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
    scales: {
      ...defaultOptions.scales,
      ...options?.scales,
    }
  }

  return (
    <div className={cn("w-full h-64", className)}>
      {type === "line" && <Line data={data as ChartData<"line">} options={mergedOptions as ChartOptions<"line">} />}
      {type === "bar" && <Bar data={data as ChartData<"bar">} options={mergedOptions as ChartOptions<"bar">} />}
    </div>
  )
}
