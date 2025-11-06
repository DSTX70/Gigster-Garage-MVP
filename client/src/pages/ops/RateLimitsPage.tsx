import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";

type Item = {
  platform: string;
  window_seconds: number;
  max_actions: number;
  used_actions: number;
  window_started_at: string;
  updated_at: string;
};

type UsagePoint = { bucket: string; total: number };

async function fetchRL() {
  const r = await fetch("/api/ops/rate-limits");
  if (!r.ok) throw new Error("Failed to fetch");
  return (await r.json()) as { items: Item[] };
}

async function fetchUsage(platform: string, window: string = "24h") {
  const r = await fetch(`/api/ops/rate-limits/${platform}/usage?window=${window}`);
  if (!r.ok) throw new Error("Failed to fetch usage");
  return (await r.json()) as { items: UsagePoint[] };
}

async function saveRL(platform: string, window_seconds: number, max_actions: number) {
  const r = await fetch("/api/ops/rate-limits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, window_seconds, max_actions })
  });
  if (!r.ok) throw new Error("Failed to save");
  return r.json();
}

async function resetWindow(platform: string) {
  const r = await fetch(`/api/ops/rate-limits/${platform}/reset`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to reset");
  return r.json();
}

async function setOverride(platform: string, factor: number, minutes: number) {
  const r = await fetch(`/api/ops/rate-limits/${platform}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ factor, minutes })
  });
  if (!r.ok) throw new Error("Failed to set override");
  return r.json();
}

async function clearOverride(platform: string) {
  const r = await fetch(`/api/ops/rate-limits/${platform}/override`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to clear override");
  return r.json();
}

export default function RateLimitsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { ws: number; ma: number }>>({});
  const [usage, setUsage] = useState<Record<string, UsagePoint[]>>({});
  const [ovr, setOvr] = useState<Record<string, { factor: number; minutes: number }>>({});
  const [win, setWin] = useState<Record<string, "6h" | "24h" | "7d">>({});
  const [view, setView] = useState<Record<string, "line" | "bar">>({});

  const load = () =>
    fetchRL()
      .then(async (d) => {
        setItems(d.items);
        // Load usage for each platform with current window
        const entries = await Promise.all(
          d.items.map((it) =>
            fetchUsage(it.platform, win[it.platform] ?? "24h").then(
              (u) => [it.platform, u.items] as const
            )
          )
        );
        const map: Record<string, UsagePoint[]> = {};
        entries.forEach(([p, arr]) => {
          map[p] = arr;
        });
        setUsage(map);
      })
      .catch(console.error);

  useEffect(() => {
    load();
  }, []);

  const onEdit = (platform: string, key: "ws" | "ma", value: number) => {
    setDrafts((d) => ({
      ...d,
      [platform]: {
        ws: key === "ws" ? value : d[platform]?.ws ?? 900,
        ma: key === "ma" ? value : d[platform]?.ma ?? 300,
      },
    }));
  };

  const toggleView = (p: string) =>
    setView((v) => ({ ...v, [p]: v[p] === "bar" ? "line" : "bar" }));

  const fmtHourOrDay = (iso: string, window: "6h" | "24h" | "7d") => {
    const d = new Date(iso);
    return window === "7d" ? `${d.getMonth() + 1}/${d.getDate()}` : `${d.getHours()}:00`;
  };

  const rolling = (arr: UsagePoint[], k: number) => {
    if (k <= 1) return arr.map((p) => ({ ...p, ma: p.total }));
    const out = [] as { bucket: string; total: number; ma: number }[];
    for (let i = 0; i < arr.length; i++) {
      const s = Math.max(0, i - (k - 1));
      const slice = arr.slice(s, i + 1);
      const avg = slice.reduce((a, b) => a + b.total, 0) / slice.length;
      out.push({ bucket: arr[i].bucket, total: arr[i].total, ma: Number(avg.toFixed(2)) });
    }
    return out;
  };

  return (
    <div className="p-6 space-y-4" data-testid="page-rate-limits">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rate Limits</h1>
        <Button onClick={load} data-testid="button-refresh">
          Refresh
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3">Platform</th>
              <th className="text-left p-3">Window (sec)</th>
              <th className="text-left p-3">Max Actions</th>
              <th className="text-left p-3">Used</th>
              <th className="text-left p-3">Window Started</th>
              <th className="text-left p-3">Actions</th>
              <th className="text-left p-3 w-[380px]">Usage Chart</th>
              <th className="text-left p-3 w-[320px]">Burst Override</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const draft = drafts[it.platform];
              const data = usage[it.platform] ?? [];
              const windowSel = win[it.platform] ?? "24h";
              const maK = windowSel === "7d" ? 2 : 3;
              const withMA = rolling(data, maK);
              const override = ovr[it.platform] ?? { factor: 1.5, minutes: 30 };
              return (
                <tr key={it.platform} className="border-t dark:border-gray-700 align-top">
                  <td className="p-3 font-medium capitalize">{it.platform}</td>
                  <td className="p-3">
                    <input
                      className="border rounded px-2 py-1 w-28 dark:bg-gray-700 dark:border-gray-600"
                      type="number"
                      value={draft?.ws ?? it.window_seconds}
                      onChange={(e) => onEdit(it.platform, "ws", Number(e.target.value))}
                      data-testid={`input-window-${it.platform}`}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="border rounded px-2 py-1 w-28 dark:bg-gray-700 dark:border-gray-600"
                      type="number"
                      value={draft?.ma ?? it.max_actions}
                      onChange={(e) => onEdit(it.platform, "ma", Number(e.target.value))}
                      data-testid={`input-max-${it.platform}`}
                    />
                  </td>
                  <td className="p-3">{it.used_actions}</td>
                  <td className="p-3">{new Date(it.window_started_at).toLocaleString()}</td>
                  <td className="p-3 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        saveRL(
                          it.platform,
                          draft?.ws ?? it.window_seconds,
                          draft?.ma ?? it.max_actions
                        ).then(load)
                      }
                      data-testid={`button-save-${it.platform}`}
                    >
                      Save
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => resetWindow(it.platform).then(load)}
                      data-testid={`button-reset-${it.platform}`}
                    >
                      Reset
                    </Button>
                  </td>
                  <td className="p-3">
                    <div className="w-[360px] space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
                          value={windowSel}
                          onChange={(e) => {
                            const w = e.target.value as "6h" | "24h" | "7d";
                            setWin((s) => ({ ...s, [it.platform]: w }));
                            fetchUsage(it.platform, w)
                              .then((u) => {
                                setUsage((prev) => ({ ...prev, [it.platform]: u.items }));
                              })
                              .catch(console.error);
                          }}
                          data-testid={`select-window-${it.platform}`}
                        >
                          <option value="6h">6h</option>
                          <option value="24h">24h</option>
                          <option value="7d">7d</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleView(it.platform)}
                          data-testid={`button-toggle-${it.platform}`}
                        >
                          {view[it.platform] === "bar" ? "Line" : "Bar"}
                        </Button>
                        <a
                          href={`/api/ops/rate-limits/${it.platform}/usage.csv?window=${windowSel}`}
                          className="text-sm underline hover:text-blue-600 dark:hover:text-blue-400"
                          download
                          data-testid={`link-export-${it.platform}`}
                        >
                          CSV
                        </a>
                      </div>
                      <div className="h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          {view[it.platform] === "bar" ? (
                            <BarChart data={withMA}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="bucket"
                                tickFormatter={(x) => fmtHourOrDay(x, windowSel)}
                                minTickGap={24}
                              />
                              <YAxis allowDecimals={false} />
                              <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />
                              <Bar dataKey="total" fill="#004C6D" />
                              <Line type="monotone" dataKey="ma" stroke="#ff7300" dot={false} />
                              <Legend />
                            </BarChart>
                          ) : (
                            <LineChart data={withMA}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="bucket"
                                tickFormatter={(x) => fmtHourOrDay(x, windowSel)}
                                minTickGap={24}
                              />
                              <YAxis allowDecimals={false} />
                              <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />
                              <Line type="monotone" dataKey="total" stroke="#004C6D" dot={false} />
                              <Line type="monotone" dataKey="ma" stroke="#ff7300" dot={false} />
                              <Legend />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <input
                          className="border rounded px-2 py-1 w-16 dark:bg-gray-700 dark:border-gray-600"
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={override.factor}
                          onChange={(e) =>
                            setOvr((o) => ({
                              ...o,
                              [it.platform]: { ...override, factor: Number(e.target.value) },
                            }))
                          }
                          placeholder="1.5"
                          data-testid={`input-factor-${it.platform}`}
                        />
                        <span className="text-xs">x</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          className="border rounded px-2 py-1 w-16 dark:bg-gray-700 dark:border-gray-600"
                          type="number"
                          min="1"
                          max="240"
                          value={override.minutes}
                          onChange={(e) =>
                            setOvr((o) => ({
                              ...o,
                              [it.platform]: { ...override, minutes: Number(e.target.value) },
                            }))
                          }
                          placeholder="30"
                          data-testid={`input-minutes-${it.platform}`}
                        />
                        <span className="text-xs">min</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setOverride(it.platform, override.factor, override.minutes).then(
                              load
                            )
                          }
                          data-testid={`button-override-${it.platform}`}
                        >
                          Apply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearOverride(it.platform).then(load)}
                          data-testid={`button-clear-${it.platform}`}
                        >
                          Clear
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tapers linearly to 1.0
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No platforms configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
