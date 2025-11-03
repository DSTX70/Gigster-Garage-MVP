import { storage } from "./storage";

export interface SwitchboardConfig {
  // Graduation criteria thresholds
  minOnTimeMilestoneRate: number;
  maxGateEscapeRate: number;
  maxIncidentCount30d: number;
  
  // Auto-promotion settings
  enableAutoPromotion: boolean;
  checkIntervalMinutes: number;
}

const DEFAULT_CONFIG: SwitchboardConfig = {
  minOnTimeMilestoneRate: 0.95,  // 95% on-time delivery
  maxGateEscapeRate: 0.01,       // ≤ 1% gate escapes
  maxIncidentCount30d: 0,        // Zero incidents
  enableAutoPromotion: true,
  checkIntervalMinutes: 60,      // Check every hour
};

export class SwitchboardService {
  private config: SwitchboardConfig;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: Partial<SwitchboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the switchboard service
   */
  start(): void {
    if (this.intervalId) {
      console.log("🔄 Switchboard service already running");
      return;
    }

    console.log(`🚀 Starting Switchboard service (check interval: ${this.config.checkIntervalMinutes}min)`);
    
    // Run immediately on start
    this.evaluateAgents();

    // Then run periodically
    this.intervalId = setInterval(
      () => this.evaluateAgents(),
      this.config.checkIntervalMinutes * 60 * 1000
    );

    console.log("✅ Switchboard service started");
  }

  /**
   * Stop the switchboard service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("⏹️  Switchboard service stopped");
    }
  }

  /**
   * Manually trigger agent evaluation
   */
  async evaluateAgents(): Promise<{
    evaluated: number;
    promoted: number;
    errors: number;
  }> {
    console.log("🔍 Switchboard: Evaluating agents for graduation...");
    
    const stats = {
      evaluated: 0,
      promoted: 0,
      errors: 0,
    };

    try {
      const agents = await storage.getAgents();
      const kpis = await storage.getAgentKpis();
      
      for (const agent of agents) {
        stats.evaluated++;
        
        try {
          // Get KPI for this agent
          const kpi = kpis.find(k => k.agentId === agent.id);
          
          if (!kpi) {
            continue; // No KPI data yet
          }

          // Check if agent meets graduation criteria
          const meetsGraduationCriteria = this.checkGraduationCriteria(kpi);
          
          if (!meetsGraduationCriteria) {
            continue; // Does not meet criteria
          }

          // Check if already exposed to users
          const visibilityFlag = await storage.getAgentVisibilityFlag(agent.id);
          if (visibilityFlag?.exposeToUsers) {
            continue; // Already promoted
          }

          // Auto-promote if enabled
          if (this.config.enableAutoPromotion) {
            await this.promoteAgent(agent.id);
            stats.promoted++;
            console.log(`✅ Switchboard: Auto-promoted ${agent.name} (${agent.id})`);
          } else {
            console.log(`📊 Switchboard: ${agent.name} (${agent.id}) ready for promotion (auto-promotion disabled)`);
          }
        } catch (error) {
          console.error(`❌ Switchboard: Error evaluating agent ${agent.id}:`, error);
          stats.errors++;
        }
      }

      console.log(`✅ Switchboard evaluation complete:`, stats);
      return stats;
    } catch (error: any) {
      // Handle database schema not ready error gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log("⏸️  Switchboard: Database tables not yet created. Skipping evaluation until tables are initialized.");
        console.log("💡 Run the agent data import to create required tables.");
      } else {
        console.error("❌ Switchboard: Fatal error during evaluation:", error);
        stats.errors++;
      }
      return stats;
    }
  }

  /**
   * Check if KPI metrics meet graduation criteria
   */
  private checkGraduationCriteria(kpi: any): boolean {
    const onTimeMilestoneRate = parseFloat(kpi.onTimeMilestoneRate);
    const gateEscapeRate = parseFloat(kpi.gateEscapeRate);
    const incidentCount = parseInt(kpi.incidentCount30d);

    return (
      onTimeMilestoneRate >= this.config.minOnTimeMilestoneRate &&
      gateEscapeRate <= this.config.maxGateEscapeRate &&
      incidentCount <= this.config.maxIncidentCount30d
    );
  }

  /**
   * Promote an agent (enable visibility flags and mark graduation complete)
   */
  private async promoteAgent(agentId: string): Promise<void> {
    // Update visibility flags
    const existingFlag = await storage.getAgentVisibilityFlag(agentId);
    
    if (existingFlag) {
      await storage.updateAgentVisibilityFlag(agentId, {
        exposeToUsers: true,
        dashboardCard: true,
      });
    } else {
      await storage.createAgentVisibilityFlag({
        agentId,
        exposeToUsers: true,
        dashboardCard: true,
      });
    }

    // Mark graduation plan as completed
    const graduationPlan = await storage.getAgentGraduationPlan(agentId);
    if (graduationPlan && !graduationPlan.completedAt) {
      await storage.updateAgentGraduationPlan(graduationPlan.id, {
        completedAt: new Date(),
      });
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SwitchboardConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SwitchboardConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart service if interval changed
    if (config.checkIntervalMinutes && this.intervalId) {
      this.stop();
      this.start();
    }
  }
}

// Export singleton instance
export const switchboard = new SwitchboardService();
