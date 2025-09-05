import { storage } from "./storage";
import { sendEmail } from "./emailService";
import { format, isAfter, startOfDay } from "date-fns";
import type { Invoice } from "@shared/schema";

/**
 * Invoice Status Automation Service
 * Handles automated invoice status tracking, overdue detection, and notifications
 */

export class InvoiceStatusService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the automated invoice status monitoring
   * Runs every hour to check for status updates
   */
  public startStatusMonitoring() {
    if (this.isRunning) {
      console.log("📋 Invoice status monitoring already running");
      return;
    }

    console.log("🚀 Starting automated invoice status monitoring");
    this.isRunning = true;

    // Run immediately on startup
    this.checkInvoiceStatuses();

    // Then run every hour
    this.intervalId = setInterval(() => {
      this.checkInvoiceStatuses();
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Stop the automated monitoring
   */
  public stopStatusMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("⏹️ Stopped invoice status monitoring");
  }

  /**
   * Main function to check and update invoice statuses
   */
  public async checkInvoiceStatuses() {
    try {
      console.log("🔍 Checking invoice statuses for updates...");
      
      const invoices = await storage.getInvoices();
      const today = startOfDay(new Date());
      let updatedCount = 0;
      let overdueNotificationsSent = 0;

      for (const invoice of invoices) {
        const wasUpdated = await this.processInvoiceStatus(invoice, today);
        if (wasUpdated.statusChanged) updatedCount++;
        if (wasUpdated.notificationSent) overdueNotificationsSent++;
      }

      console.log(`✅ Invoice status check complete: ${updatedCount} statuses updated, ${overdueNotificationsSent} overdue notifications sent`);
    } catch (error) {
      console.error("❌ Error during invoice status check:", error);
    }
  }

  /**
   * Process individual invoice status and determine if updates are needed
   */
  private async processInvoiceStatus(invoice: Invoice, today: Date): Promise<{statusChanged: boolean, notificationSent: boolean}> {
    let statusChanged = false;
    let notificationSent = false;

    // Skip if invoice is already paid or cancelled
    if (invoice.status === "paid" || invoice.status === "cancelled") {
      return { statusChanged, notificationSent };
    }

    // Check if invoice should be marked as overdue
    if (invoice.status === "sent" && invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const isOverdue = isAfter(today, dueDate);

      if (isOverdue) {
        // Update status to overdue
        await storage.updateInvoice(invoice.id, { status: "overdue" });
        statusChanged = true;
        
        console.log(`📋 Invoice ${invoice.invoiceNumber} marked as overdue (due: ${format(dueDate, 'MMM d, yyyy')})`);

        // Send overdue notification
        const emailSent = await this.sendOverdueNotification(invoice);
        if (emailSent) {
          notificationSent = true;
        }
      }
    }

    return { statusChanged, notificationSent };
  }

  /**
   * Send overdue notification email to client
   */
  private async sendOverdueNotification(invoice: Invoice): Promise<boolean> {
    if (!invoice.clientEmail) {
      console.log(`⚠️ Cannot send overdue notification for invoice ${invoice.invoiceNumber}: no client email`);
      return false;
    }

    const daysOverdue = Math.floor((Date.now() - new Date(invoice.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
    
    const subject = `Payment Overdue - Invoice ${invoice.invoiceNumber}`;
    const textContent = `
Dear ${invoice.clientName || 'Valued Client'},

This is a friendly reminder that invoice ${invoice.invoiceNumber} is now ${daysOverdue} day(s) overdue.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Amount Due: $${invoice.balanceDue || invoice.totalAmount}
- Original Due Date: ${format(new Date(invoice.dueDate!), 'MMMM d, yyyy')}
- Days Overdue: ${daysOverdue}

Please submit your payment at your earliest convenience to avoid any late fees or service interruptions.

If you have any questions or need to discuss payment arrangements, please contact us immediately.

Thank you for your prompt attention to this matter.

Best regards,
Gigster Garage Team
    `.trim();

    const htmlContent = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #721c24;">⚠️ Payment Overdue Notice</h2>
        </div>
        
        <p>Dear ${invoice.clientName || 'Valued Client'},</p>
        
        <p>This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> is now <strong>${daysOverdue} day(s) overdue</strong>.</p>
        
        <div style="background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc3545;">Invoice Details</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
            <li><strong>Amount Due:</strong> $${invoice.balanceDue || invoice.totalAmount}</li>
            <li><strong>Original Due Date:</strong> ${format(new Date(invoice.dueDate!), 'MMMM d, yyyy')}</li>
            <li><strong>Days Overdue:</strong> ${daysOverdue}</li>
          </ul>
        </div>
        
        <p>Please submit your payment at your earliest convenience to avoid any late fees or service interruptions.</p>
        
        <p>If you have any questions or need to discuss payment arrangements, please contact us immediately.</p>
        
        <p>Thank you for your prompt attention to this matter.</p>
        
        <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px;">
          <p style="margin: 0;"><strong>Best regards,</strong><br>
          Gigster Garage Team</p>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      const emailSent = await sendEmail({
        to: invoice.clientEmail,
        from: 'billing@gigstergarage.com', // Default from email
        subject,
        text: textContent,
        html: htmlContent
      });

      if (emailSent) {
        console.log(`📧 Overdue notification sent for invoice ${invoice.invoiceNumber} to ${invoice.clientEmail}`);
      } else {
        console.log(`❌ Failed to send overdue notification for invoice ${invoice.invoiceNumber}`);
      }

      return emailSent;
    } catch (error) {
      console.error(`❌ Error sending overdue notification for invoice ${invoice.invoiceNumber}:`, error);
      return false;
    }
  }

  /**
   * Manual trigger for status updates (useful for admin actions or debugging)
   */
  public async manualStatusUpdate(): Promise<{updatedInvoices: number, notificationsSent: number}> {
    console.log("🔧 Manual invoice status update triggered");
    
    const invoices = await storage.getInvoices();
    const today = startOfDay(new Date());
    let updatedInvoices = 0;
    let notificationsSent = 0;

    for (const invoice of invoices) {
      const result = await this.processInvoiceStatus(invoice, today);
      if (result.statusChanged) updatedInvoices++;
      if (result.notificationSent) notificationsSent++;
    }

    return { updatedInvoices, notificationsSent };
  }

  /**
   * Get overdue invoice statistics
   */
  public async getOverdueStats(): Promise<{
    totalOverdue: number;
    totalOverdueAmount: number;
    overdueInvoices: Invoice[];
  }> {
    const invoices = await storage.getInvoices();
    const overdueInvoices = invoices.filter(inv => inv.status === "overdue");
    const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => 
      sum + parseFloat(inv.balanceDue || inv.totalAmount || "0"), 0
    );

    return {
      totalOverdue: overdueInvoices.length,
      totalOverdueAmount,
      overdueInvoices
    };
  }
}

// Singleton instance
export const invoiceStatusService = new InvoiceStatusService();