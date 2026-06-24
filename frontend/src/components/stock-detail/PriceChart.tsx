"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
} from "recharts";
import { PriceBar } from "@/types/stock";
import { formatPrice } from "@/lib/utils";

interface Props {
  history: PriceBar[];
  sma20?: number | null;
  sma50?: number | null;
  sma200?: number | null;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-gray-600">
          {p.name}: {typeof p.value === "number" ? formatPrice(p.value) : p.value}
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

  const isUp = (history[history.length - 1]?.close ?? 0) >= (history[0]?.close ?? 0);
  const color = isUp ? "#16a34a" : "#dc2626";
  const fillColor = isUp ? "#dcfce7" : "#fee2e2";

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={history} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
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
      </AreaChart>
    </ResponsiveContainer>
  );
}
