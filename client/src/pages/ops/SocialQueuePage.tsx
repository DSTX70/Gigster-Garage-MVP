import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  profile_id: string;
  platform: string;
  content: any;
  scheduled_at: string;
  status: string;
  attempts: number;
  next_attempt_at: string | null;
  last_error: string | null;
};

async function fetchQueue(params: Record<string, string | number> = {}) {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/ops/social-queue?${q}`);
  if (!res.ok) throw new Error("Failed");
  return (await res.json()) as { items: Item[] };
}

async function postAction(id: string, action: "pause" | "resume" | "retry" | "cancel") {
  const res = await fetch(`/api/ops/social-queue/${id}/${action}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function SocialQueuePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<{ status?: string; platform?: string }>({});

  const load = () => fetchQueue(filter).then(r => setItems(r.items)).catch(console.error);

  useEffect(() => {
    load();
  }, [JSON.stringify(filter)]);

  const handleAction = async (id: string, action: "pause" | "resume" | "retry" | "cancel") => {
    try {
      await postAction(id, action);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-4" data-testid="page-social-queue">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Social Queue</h1>
        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1"
            value={filter.status ?? ""}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value || undefined }))}
            data-testid="filter-status"
          >
            <option value="">All Statuses</option>
            {["queued", "posting", "posted", "failed", "paused", "cancelled"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1"
            value={filter.platform ?? ""}
            onChange={e => setFilter(f => ({ ...f, platform: e.target.value || undefined }))}
            data-testid="filter-platform"
          >
            <option value="">All Platforms</option>
            {["x", "instagram", "linkedin", "facebook", "tiktok", "youtube"].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <Button onClick={load} data-testid="button-refresh">Refresh</Button>
        </div>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">Platform</th>
              <th className="text-left p-3">Profile</th>
              <th className="text-left p-3">Content</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Attempts</th>
              <th className="text-left p-3">Next Try</th>
              <th className="text-left p-3">Error</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-t dark:border-gray-700">
                <td className="p-3">{new Date(it.scheduled_at).toLocaleString()}</td>
                <td className="p-3 capitalize">{it.platform}</td>
                <td className="p-3 font-mono text-xs">{it.profile_id}</td>
                <td className="p-3">
                  <div className="max-w-[420px]">
                    <div className="text-sm mb-2 line-clamp-2" title={it.content?.text || ""}>
                      {it.content?.text || "—"}
                    </div>
                    {Array.isArray(it.content?.mediaUrls) && it.content.mediaUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {it.content.mediaUrls.slice(0, 8).map((u: string, idx: number) => (
                          <img
                            key={idx}
                            src={u}
                            alt=""
                            loading="lazy"
                            className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                            title={u}
                            data-testid={`media-thumbnail-${it.id}-${idx}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      it.status === "failed" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                      it.status === "posted" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      it.status === "paused" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      it.status === "posting" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {it.status}
                  </span>
                </td>
                <td className="p-3">{it.attempts}</td>
                <td className="p-3 text-xs">
                  {it.next_attempt_at ? new Date(it.next_attempt_at).toLocaleString() : "-"}
                </td>
                <td className="p-3 max-w-[240px] truncate text-xs text-red-600 dark:text-red-400" title={it.last_error || ""}>
                  {it.last_error || "-"}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {it.status === "paused" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(it.id, "resume")}
                        data-testid={`button-resume-${it.id}`}
                      >
                        Resume
                      </Button>
                    )}
                    {(it.status === "queued" || it.status === "failed") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(it.id, "pause")}
                        data-testid={`button-pause-${it.id}`}
                      >
                        Pause
                      </Button>
                    )}
                    {it.status === "failed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(it.id, "retry")}
                        data-testid={`button-retry-${it.id}`}
                      >
                        Retry
                      </Button>
                    )}
                    {(it.status === "queued" || it.status === "failed" || it.status === "paused") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(it.id, "cancel")}
                        data-testid={`button-cancel-${it.id}`}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No items in queue
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
