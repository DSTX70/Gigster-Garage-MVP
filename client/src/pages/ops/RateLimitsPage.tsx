import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Item = {
  platform: string;
  window_seconds: number;
  max_actions: number;
  used_actions: number;
  window_started_at: string;
  updated_at: string;
};

async function fetchRL() {
  const r = await fetch("/api/ops/rate-limits");
  if (!r.ok) throw new Error("Failed to fetch");
  return (await r.json()) as { items: Item[] };
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

export default function RateLimitsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { ws: number; ma: number }>>({});

  const load = () => fetchRL().then(d => setItems(d.items)).catch(console.error);
  
  useEffect(() => {
    load();
  }, []);

  const onEdit = (platform: string, key: "ws" | "ma", value: number) => {
    setDrafts(d => ({
      ...d,
      [platform]: {
        ws: key === "ws" ? value : (d[platform]?.ws ?? 900),
        ma: key === "ma" ? value : (d[platform]?.ma ?? 300)
      }
    }));
  };

  const onSave = (platform: string) => {
    const d = drafts[platform];
    const ws = d?.ws ?? items.find(x => x.platform === platform)?.window_seconds ?? 900;
    const ma = d?.ma ?? items.find(x => x.platform === platform)?.max_actions ?? 300;
    saveRL(platform, ws, ma).then(load).catch(console.error);
  };

  return (
    <div className="p-6 space-y-4" data-testid="page-rate-limits">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rate Limits</h1>
        <Button onClick={load} data-testid="button-refresh">Refresh</Button>
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
            </tr>
          </thead>
          <tbody>
            {items.map(it => {
              const draft = drafts[it.platform];
              return (
                <tr key={it.platform} className="border-t dark:border-gray-700">
                  <td className="p-3 font-medium capitalize">{it.platform}</td>
                  <td className="p-3">
                    <input
                      className="border rounded px-2 py-1 w-28 dark:bg-gray-700 dark:border-gray-600"
                      type="number"
                      value={draft?.ws ?? it.window_seconds}
                      onChange={e => onEdit(it.platform, "ws", Number(e.target.value))}
                      data-testid={`input-window-${it.platform}`}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="border rounded px-2 py-1 w-28 dark:bg-gray-700 dark:border-gray-600"
                      type="number"
                      value={draft?.ma ?? it.max_actions}
                      onChange={e => onEdit(it.platform, "ma", Number(e.target.value))}
                      data-testid={`input-max-${it.platform}`}
                    />
                  </td>
                  <td className="p-3">{it.used_actions}</td>
                  <td className="p-3">{new Date(it.window_started_at).toLocaleString()}</td>
                  <td className="p-3 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => onSave(it.platform)}
                      data-testid={`button-save-${it.platform}`}
                    >
                      Save
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => resetWindow(it.platform).then(load)}
                      data-testid={`button-reset-${it.platform}`}
                    >
                      Reset Window
                    </Button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 dark:text-gray-400">
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
