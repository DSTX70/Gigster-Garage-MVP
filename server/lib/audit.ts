// Simple audit logging helper
// In production, this could write to a dedicated audit_log table or external service

export const audit = {
  async emit(event: string, payload: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      ...payload
    };
    
    // For now, just log to console
    // In production, write to database or external audit service
    console.log(`[AUDIT] ${event}`, JSON.stringify(logEntry));
    
    // TODO: Persist to audit_log table if needed
    // await pool.query(
    //   `INSERT INTO audit_log (event, payload, timestamp) VALUES ($1, $2, $3)`,
    //   [event, JSON.stringify(payload), timestamp]
    // );
  }
};
