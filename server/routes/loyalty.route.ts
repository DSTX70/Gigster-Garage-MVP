import { Router } from "express";
import { pool } from "../db";

const r = Router();

r.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, delta_points, reason, metadata, created_at 
       FROM loyalty_ledger 
       ORDER BY created_at DESC 
       LIMIT 1000`
    );
    res.json({ items: result.rows });
  } catch (error) {
    console.error("[loyalty] Failed to fetch ledger:", error);
    res.json({ items: [] });
  }
});

r.get("/export.csv", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, delta_points, reason, created_at 
       FROM loyalty_ledger 
       ORDER BY created_at DESC`
    );
    
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="loyalty_ledger_${Date.now()}.csv"`);
    res.write("user_id,delta_points,reason,created_at\n");
    
    for (const row of result.rows) {
      res.write(`${row.user_id},${row.delta_points},"${row.reason}",${new Date(row.created_at).toISOString()}\n`);
    }
    
    res.end();
  } catch (error) {
    console.error("[loyalty] Failed to export CSV:", error);
    res.status(500).json({ error: "Failed to export loyalty data" });
  }
});

export default r;
