import { storage } from "./storage";
import { sendEmail } from "./emailService";
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import type { Contract } from "@shared/schema";

/**
 * Contract Management Service
 * Handles legal document lifecycle, e-signatures, renewals, and compliance
 */

export class ContractManagementService {
  private isMonitoring = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start automated contract monitoring for renewals, expirations, and reminders
   */
  public startContractMonitoring() {
    if (this.isMonitoring) {
      console.log("📋 Contract monitoring already running");
      return;
    }

    console.log("🚀 Starting automated contract monitoring");
    this.isMonitoring = true;

    // Run immediately on startup
    this.checkContractStatuses();

    // Then run daily at 9 AM
    this.intervalId = setInterval(() => {
      this.checkContractStatuses();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Stop contract monitoring
   */
  public stopContractMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log("⏹️ Stopped contract monitoring");
  }

  /**
   * Main function to check contract statuses and send notifications
   */
  public async checkContractStatuses() {
    try {
      console.log("🔍 Checking contract statuses for updates...");
      
      const contracts = await storage.getContracts();
      const today = startOfDay(new Date());
      let renewalNotifications = 0;
      let expirationWarnings = 0;
      let autoRenewals = 0;

      for (const contract of contracts) {
        const results = await this.processContractLifecycle(contract, today);
        renewalNotifications += results.renewalNotification ? 1 : 0;
        expirationWarnings += results.expirationWarning ? 1 : 0;
        autoRenewals += results.autoRenewal ? 1 : 0;
      }

      console.log(`✅ Contract monitoring complete: ${renewalNotifications} renewal notices, ${expirationWarnings} expiration warnings, ${autoRenewals} auto-renewals`);
    } catch (error) {
      console.error("❌ Error during contract status check:", error);
    }
  }

  /**
   * Process individual contract lifecycle events
   */
  private async processContractLifecycle(contract: Contract, today: Date): Promise<{
    renewalNotification: boolean;
    expirationWarning: boolean;
    autoRenewal: boolean;
  }> {
    let renewalNotification = false;
    let expirationWarning = false;
    let autoRenewal = false;

    // Skip if contract is not active
    if (!contract.status || !['fully_signed', 'executed'].includes(contract.status)) {
      return { renewalNotification, expirationWarning, autoRenewal };
    }

    // Check for contract expiration and renewal
    if (contract.expirationDate) {
      const expirationDate = new Date(contract.expirationDate);
      const noticePeriod = contract.noticePeriod || 30;
      const noticeDate = addDays(expirationDate, -noticePeriod);

      // Check if we should send expiration notice
      if (isAfter(today, noticeDate) && isBefore(today, expirationDate)) {
        const daysTillExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminder if we haven't sent one in the last week
        const lastReminder = contract.lastReminderSent ? new Date(contract.lastReminderSent) : null;
        const weekAgo = addDays(today, -7);
        
        if (!lastReminder || isBefore(lastReminder, weekAgo)) {
          await this.sendExpirationNotice(contract, daysTillExpiration);
          await storage.updateContract(contract.id, {
            lastReminderSent: new Date(),
            reminderCount: (contract.reminderCount || 0) + 1
          });
          expirationWarning = true;
        }
      }

      // Check for auto-renewal
      if (contract.autoRenewal && isAfter(today, expirationDate)) {
        await this.processAutoRenewal(contract);
        autoRenewal = true;
      }

      // Mark as expired if past expiration date and not auto-renewed
      if (isAfter(today, expirationDate) && !contract.autoRenewal && contract.status !== 'expired') {
        await storage.updateContract(contract.id, { status: 'expired' });
        console.log(`📋 Contract ${contract.contractNumber} marked as expired`);
      }
    }

    return { renewalNotification, expirationWarning, autoRenewal };
  }

  /**
   * Send contract expiration notice
   */
  private async sendExpirationNotice(contract: Contract, daysRemaining: number): Promise<boolean> {
    try {
      // Get contract creator for notification
      let notificationEmail = 'legal@gigstergarage.com';
      if (contract.createdById) {
        const creator = await storage.getUser(contract.createdById);
        if (creator?.email) {
          notificationEmail = creator.email;
        }
      }

      const subject = `Contract Expiration Notice - ${contract.title} (${daysRemaining} days)`;
      
      const textContent = `
CONTRACT EXPIRATION NOTICE

Contract: ${contract.title}
Contract Number: ${contract.contractNumber}
Client: ${contract.clientName || 'Unknown Client'}
Days Remaining: ${daysRemaining}
Expiration Date: ${format(new Date(contract.expirationDate!), 'MMMM d, yyyy')}
Status: ${contract.status ? contract.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}

${contract.autoRenewal ? 'This contract is set for automatic renewal.' : 'ACTION REQUIRED: Review this contract for renewal or termination.'}

Contract Details:
- Contract Type: ${contract.contractType.replace('_', ' ').toUpperCase()}
- Contract Value: ${contract.currency} ${contract.contractValue}
- Auto Renewal: ${contract.autoRenewal ? 'Yes' : 'No'}

${contract.autoRenewal ? '' : `
Please take action before the expiration date:
1. Renew the contract if services will continue
2. Negotiate new terms if needed
3. Terminate gracefully if services are ending
4. Ensure all deliverables are completed
`}

View contract details in your Gigster Garage dashboard.

Best regards,
Gigster Garage Legal System
      `.trim();

      const htmlContent = `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin: 0;">⚠️ Contract Expiration Notice</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${daysRemaining} days remaining</p>
          </div>
          
          <div style="background: #f8f9fa; border-left: 4px solid #004C6D; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #004C6D;">Contract Details</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Contract:</strong> ${contract.title}</li>
              <li><strong>Contract Number:</strong> ${contract.contractNumber}</li>
              <li><strong>Client:</strong> ${contract.clientName || 'Unknown Client'}</li>
              <li><strong>Expiration Date:</strong> ${format(new Date(contract.expirationDate!), 'MMMM d, yyyy')}</li>
              <li><strong>Contract Type:</strong> ${contract.contractType.replace('_', ' ').toUpperCase()}</li>
              <li><strong>Contract Value:</strong> ${contract.currency} ${contract.contractValue}</li>
              <li><strong>Auto Renewal:</strong> ${contract.autoRenewal ? 'Yes' : 'No'}</li>
            </ul>
          </div>
          
          ${contract.autoRenewal ? `
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0c5460;">🔄 Automatic Renewal</h4>
            <p style="margin: 0;">This contract is configured for automatic renewal. It will be extended automatically unless you take action to modify or terminate it.</p>
          </div>
          ` : `
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #721c24;">⚡ Action Required</h4>
            <p style="margin: 0;">Please take action before the expiration date:</p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Renew the contract if services will continue</li>
              <li>Negotiate new terms if needed</li>
              <li>Terminate gracefully if services are ending</li>
              <li>Ensure all deliverables are completed</li>
            </ol>
          </div>
          `}
          
          <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px;">
            <p style="margin: 0;"><strong>Manage your contracts</strong><br>
            View full contract details and manage renewals in your Gigster Garage dashboard.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const emailSent = await sendEmail({
        to: notificationEmail,
        from: 'legal@gigstergarage.com',
        subject,
        text: textContent,
        html: htmlContent
      });

      if (emailSent) {
        console.log(`📧 Contract expiration notice sent for "${contract.title}" (${daysRemaining} days) to ${notificationEmail}`);
      }

      return emailSent;
    } catch (error) {
      console.error(`❌ Error sending contract expiration notice:`, error);
      return false;
    }
  }

  /**
   * Process automatic contract renewal
   */
  private async processAutoRenewal(contract: Contract): Promise<void> {
    try {
      const renewalPeriod = contract.renewalPeriod || 365; // Default 1 year
      const newExpirationDate = addDays(new Date(contract.expirationDate!), renewalPeriod);
      
      await storage.updateContract(contract.id, {
        expirationDate: newExpirationDate.toISOString().split('T')[0],
        renewalDate: new Date().toISOString().split('T')[0],
        reminderCount: 0,
        lastReminderSent: null,
        metadata: {
          ...contract.metadata,
          autoRenewed: true,
          lastRenewalDate: new Date().toISOString(),
          previousExpirationDate: contract.expirationDate
        }
      });

      console.log(`🔄 Auto-renewed contract ${contract.contractNumber} until ${format(newExpirationDate, 'MMM d, yyyy')}`);
      
      // Send auto-renewal notification
      await this.sendAutoRenewalNotification(contract, newExpirationDate);
    } catch (error) {
      console.error(`❌ Error processing auto-renewal for contract ${contract.contractNumber}:`, error);
    }
  }

  /**
   * Send auto-renewal notification
   */
  private async sendAutoRenewalNotification(contract: Contract, newExpirationDate: Date): Promise<void> {
    try {
      let notificationEmail = 'legal@gigstergarage.com';
      if (contract.createdById) {
        const creator = await storage.getUser(contract.createdById);
        if (creator?.email) {
          notificationEmail = creator.email;
        }
      }

      const subject = `Contract Auto-Renewed - ${contract.title}`;
      
      const textContent = `
CONTRACT AUTO-RENEWAL NOTIFICATION

The following contract has been automatically renewed:

Contract: ${contract.title}
Contract Number: ${contract.contractNumber}
Client: ${contract.clientName || 'Unknown Client'}
Previous Expiration: ${format(new Date(contract.expirationDate!), 'MMMM d, yyyy')}
New Expiration: ${format(newExpirationDate, 'MMMM d, yyyy')}
Renewal Period: ${contract.renewalPeriod || 365} days

This contract was set for automatic renewal and has been extended according to the original terms.

If you need to modify the renewal terms or cancel the auto-renewal, please update the contract settings in your dashboard.

Best regards,
Gigster Garage Legal System
      `.trim();

      await sendEmail({
        to: notificationEmail,
        from: 'legal@gigstergarage.com',
        subject,
        text: textContent,
        html: textContent.replace(/\n/g, '<br>')
      });

      console.log(`📧 Auto-renewal notification sent for contract ${contract.contractNumber}`);
    } catch (error) {
      console.error('❌ Error sending auto-renewal notification:', error);
    }
  }

  /**
   * Get contract management statistics
   */
  public async getContractStats(): Promise<{
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number;
    expiredContracts: number;
    pendingSignatures: number;
    autoRenewals: number;
    contractValue: number;
  }> {
    try {
      const contracts = await storage.getContracts();
      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);

      const stats = {
        totalContracts: contracts.length,
        activeContracts: contracts.filter(c => c.status && ['fully_signed', 'executed'].includes(c.status)).length,
        expiringContracts: contracts.filter(c => 
          c.expirationDate && 
          new Date(c.expirationDate) <= thirtyDaysFromNow && 
          new Date(c.expirationDate) > today &&
          c.status && ['fully_signed', 'executed'].includes(c.status)
        ).length,
        expiredContracts: contracts.filter(c => c.status && c.status === 'expired').length,
        pendingSignatures: contracts.filter(c => c.status && ['sent', 'viewed', 'pending_signature', 'partially_signed'].includes(c.status)).length,
        autoRenewals: contracts.filter(c => c.autoRenewal && c.status && ['fully_signed', 'executed'].includes(c.status)).length,
        contractValue: contracts
          .filter(c => c.status && ['fully_signed', 'executed'].includes(c.status))
          .reduce((sum, c) => sum + parseFloat(c.contractValue || "0"), 0)
      };

      return stats;
    } catch (error) {
      console.error('❌ Error calculating contract stats:', error);
      throw error;
    }
  }
}

// Singleton instance
export const contractManagementService = new ContractManagementService();