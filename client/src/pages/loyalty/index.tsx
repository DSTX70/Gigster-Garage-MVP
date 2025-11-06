import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function LoyaltyAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/loyalty")
      .then(r => r.json())
      .then(d => {
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Loyalty Program</h1>
        <Button 
          variant="outline" 
          size="sm"
          asChild
          data-testid="button-export-loyalty"
        >
          <a href="/api/loyalty/export.csv">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </a>
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No loyalty records yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User ID</th>
                  <th className="text-left p-2">Δ Points</th>
                  <th className="text-left p-2">Reason</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row: any) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800" data-testid={`row-loyalty-${row.id}`}>
                    <td className="p-2">{row.user_id}</td>
                    <td className="p-2">
                      <span className={row.delta_points > 0 ? "text-green-600" : "text-red-600"}>
                        {row.delta_points > 0 ? "+" : ""}{row.delta_points}
                      </span>
                    </td>
                    <td className="p-2">{row.reason}</td>
                    <td className="p-2">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
