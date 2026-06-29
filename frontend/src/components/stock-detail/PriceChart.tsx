"use client";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PriceBar } from "@/types/stock";
import { formatPrice, computeSMA } from "@/lib/utils";

interface Props {
  history: PriceBar[];
}

interface ChartBar extends PriceBar {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-gray-600">
          {p.name}:{" "}
          {typeof p.value === "number" ? formatPrice(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export function PriceChart({ history }: Props) {
  if (!history.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No price data available
      </div>
    );
  }

  const isUp =
    (history[history.length - 1]?.close ?? 0) >= (history[0]?.close ?? 0);
  const color = isUp ? "#16a34a" : "#dc2626";

  const sma20 = computeSMA(history, 20);
  const sma50 = computeSMA(history, 50);
  const sma200 = computeSMA(history, 200);

  const chartData: ChartBar[] = history.map((bar, i) => ({
    ...bar,
    sma20: sma20[i],
    sma50: sma50[i],
    sma200: sma200[i],
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={(d: string) => {
              const parts = d.split("-");
              return `${parts[1]}/${parts[2]}`;
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
            domain={["auto", "auto"]}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            name="Close"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="sma20"
            name="SMA 20"
            stroke="#f59e0b"
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
            strokeDasharray="5 3"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="sma50"
            name="SMA 50"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
            strokeDasharray="5 3"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="sma200"
            name="SMA 200"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
            strokeDasharray="5 3"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "#f59e0b" }} />
          SMA 20
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "#3b82f6" }} />
          SMA 50
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "#8b5cf6" }} />
          SMA 200
        </span>
      </div>
    </div>
  );
}
