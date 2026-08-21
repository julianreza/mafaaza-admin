"use client";

import { useState } from "react";
import type { transactions } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";

interface SalesChartProps {
  points?: transactions.SalesChartPoint[];
}

export function SalesChart({ points }: SalesChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dataPoints =
    points && points.length > 0
      ? points.map((p) => ({
          label: p.label,
          value: p.revenue,
          orders: p.orders,
        }))
      : [
          { label: "08:00", value: 450000, orders: 3 },
          { label: "10:00", value: 1200000, orders: 8 },
          { label: "12:00", value: 3800000, orders: 15 },
          { label: "14:00", value: 2400000, orders: 10 },
          { label: "16:00", value: 1800000, orders: 7 },
          { label: "18:00", value: 4200000, orders: 18 },
          { label: "20:00", value: 2900000, orders: 12 },
        ];

  const peakIndex = dataPoints.reduce(
    (best, p, i) => (p.value > dataPoints[best].value ? i : best),
    0,
  );

  // SVG Dimensions
  const SVG_W = 520;
  const SVG_H = 190;
  const PAD_L = 30;
  const PAD_R = 30;
  const PAD_T = 36;
  const PAD_B = 30;

  const chartW = SVG_W - PAD_L - PAD_R;
  const chartH = SVG_H - PAD_T - PAD_B;

  const maxValue = Math.max(...dataPoints.map((p) => p.value), 1);

  // Calculate coordinates for each point
  const coords = dataPoints.map((p, i) => {
    const x =
      dataPoints.length === 1
        ? PAD_L + chartW / 2
        : PAD_L + (i / (dataPoints.length - 1)) * chartW;
    const y = PAD_T + chartH - (p.value / maxValue) * (chartH - 10);
    return { x, y, label: p.label, value: p.value, orders: p.orders };
  });

  // Construct smooth SVG path
  const linePathD = coords.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
  }, "");

  // Area fill path below the line
  const areaPathD = `${linePathD} L ${coords[coords.length - 1].x} ${
    PAD_T + chartH
  } L ${coords[0].x} ${PAD_T + chartH} Z`;

  // Subtle Y-axis grid lines (4 levels)
  const gridYLevels = [0.25, 0.5, 0.75, 1];

  const activeIndex = hoveredIdx !== null ? hoveredIdx : null;
  const activePt = activeIndex !== null ? coords[activeIndex] : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">Tren Penjualan</h2>
        <span className="text-xs text-muted-foreground">Hari Ini</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Puncak omset:{" "}
        <span className="font-semibold text-foreground">
          {formatPrice(dataPoints[peakIndex].value)}
        </span>{" "}
        ({dataPoints[peakIndex].label})
      </p>

      <div className="relative">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full overflow-visible"
          role="img"
          aria-label={`Line chart tren penjualan hari ini, puncak ${formatPrice(
            dataPoints[peakIndex].value,
          )}`}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Area Gradient Fill */}
            <linearGradient id="lineChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Guide Lines */}
          {gridYLevels.map((lvl, idx) => {
            const y = PAD_T + chartH - lvl * (chartH - 10);
            return (
              <line
                key={idx}
                x1={PAD_L}
                y1={y}
                x2={SVG_W - PAD_R}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
                strokeWidth="1"
              />
            );
          })}

          {/* Gradient Area Below Line */}
          <path d={areaPathD} fill="url(#lineChartGradient)" />

          {/* Main Smooth Line Path */}
          <path
            d={linePathD}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Vertical Guideline */}
          {activePt && (
            <line
              x1={activePt.x}
              y1={PAD_T - 5}
              x2={activePt.x}
              y2={PAD_T + chartH}
              stroke="var(--brand)"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              className="opacity-70"
            />
          )}

          {/* Data Nodes (Circles) & X-Axis Labels */}
          {coords.map((pt, i) => {
            const isPeak = i === peakIndex;
            const isHovered = i === activeIndex;

            return (
              <g key={`${pt.label}-${i}`}>
                {/* X-Axis Time Label */}
                <text
                  x={pt.x}
                  y={SVG_H - 6}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered
                      ? "fill-brand font-bold"
                      : "fill-muted-foreground"
                  }`}
                >
                  {pt.label}
                </text>

                {/* Peak Badge Label (Hide when hovered to prevent overlap) */}
                {isPeak && !activePt && (
                  <g transform={`translate(${pt.x}, ${pt.y - 14})`}>
                    <rect
                      x="-24"
                      y="-16"
                      width="48"
                      height="18"
                      rx="9"
                      className="fill-brand-deep"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      className="fill-white text-[10px] font-bold"
                    >
                      {(pt.value / 1000).toFixed(0)}k
                    </text>
                  </g>
                )}

                {/* Invisible Large Hitbox for Smooth Hovering */}
                <rect
                  x={pt.x - 20}
                  y={PAD_T - 10}
                  width="40"
                  height={chartH + 20}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                />

                {/* Node Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "7" : isPeak ? "5.5" : "4"}
                  className={`transition-all duration-150 ${
                    isHovered
                      ? "fill-brand-deep stroke-white stroke-2 shadow-md"
                      : isPeak
                      ? "fill-brand-deep stroke-background stroke-2"
                      : "fill-brand stroke-background stroke-2"
                  }`}
                />
              </g>
            );
          })}

          {/* Active Floating Tooltip Box */}
          {activePt && (
            <g
              transform={`translate(${Math.min(
                Math.max(activePt.x, 60),
                SVG_W - 60,
              )}, ${Math.max(activePt.y - 42, 10)})`}
              className="pointer-events-none transition-transform duration-100 ease-out"
            >
              <rect
                x="-60"
                y="-32"
                width="120"
                height="40"
                rx="10"
                className="fill-popover stroke-border shadow-lg"
              />
              <text
                x="0"
                y="-15"
                textAnchor="middle"
                className="fill-foreground text-[11px] font-bold"
              >
                {formatPrice(activePt.value)}
              </text>
              <text
                x="0"
                y="-2"
                textAnchor="middle"
                className="fill-muted-foreground text-[9.5px] font-medium"
              >
                Jam {activePt.label} WIB {activePt.orders ? `(${activePt.orders} pesanan)` : ""}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}



