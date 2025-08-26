import { MailService } from '@sendgrid/mail';
import twilio from 'twilio';
import type { Task, User } from '@shared/schema';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY_2 || process.env.SENDGRID_API_KEY;

if (!SENDGRID_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email notifications disabled");
}

const mailService = new MailService();
if (SENDGRID_KEY) {
  if (SENDGRID_KEY.startsWith('SG.')) {
    mailService.setApiKey(SENDGRID_KEY);
    console.log("✅ SendGrid API key configured successfully");
  } else {
    console.warn("Invalid SendGrid API key format - must start with 'SG.' - email notifications disabled");
  }
}

const APP_URL = process.env.REPLIT_DOMAINS 
  ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
  : 'http://localhost:5000';

// Initialize Twilio client if credentials are available
let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    try {
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log("✅ Twilio SMS integration configured successfully");
    } catch (error: any) {
      console.error("❌ Twilio initialization failed:", error.message);
      console.log("⚠️  SMS notifications disabled due to invalid credentials");
    }
  } else {
    console.error("❌ Invalid Twilio Account SID - must start with 'AC', got:", process.env.TWILIO_ACCOUNT_SID.substring(0, 2));
    console.log("⚠️  SMS notifications disabled - need valid Account SID starting with 'AC'");
  }
} else {
  console.log("⚠️  Twilio credentials not found - SMS notifications disabled");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: Buffer | string;
    filename: string;
    type?: string;
    disposition?: string;
  }>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const SENDGRID_KEY = process.env.SENDGRID_API_KEY_2 || process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_KEY || !SENDGRID_KEY.startsWith('SG.')) {
    console.log("📧 Email notification would be sent:", params.subject, "to", params.to);
    console.log("   (Email disabled: SendGrid API key not configured properly)");
    return false;
  }

  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    };

    // Add attachments if provided
    if (params.attachments && params.attachments.length > 0) {
      emailData.attachments = params.attachments.map(attachment => ({
        content: Buffer.isBuffer(attachment.content) 
          ? attachment.content.toString('base64') 
          : attachment.content,
        filename: attachment.filename,
        type: attachment.type || 'application/pdf',
        disposition: attachment.disposition || 'attachment'
      }));
    }

    await mailService.send(emailData);
    console.log(`Email sent successfully to ${params.to}${params.attachments ? ` with ${params.attachments.length} attachment(s)` : ''}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Enhanced email function that can handle different types of emails
export async function sendCustomEmail(
  to: string,
  subject: string,
  textContent: string,
  htmlContent: string,
  fromEmail: string = 'dustinsparks@mac.com'
): Promise<boolean> {
  return await sendEmail({
    to,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent,
  });
}

// Send proposal via email with optional PDF attachment
export async function sendProposalEmail(
  clientEmail: string,
  proposalTitle: string,
  proposalUrl: string,
  clientName: string = '',
  customMessage: string = '',
  pdfAttachment?: Buffer,
  fromEmail: string = 'dustinsparks@mac.com'
): Promise<boolean> {
  const subject = `Proposal: ${proposalTitle}`;
  
  const textContent = `
Dear ${clientName || 'Valued Client'},

${customMessage || 'We are pleased to present our proposal for your review.'}

Proposal: ${proposalTitle}

Please click the link below to view your proposal:
${proposalUrl}

This proposal link will remain active and you can review it at any time. The proposal includes all project details, timeline, deliverables, and pricing information.

If you have any questions or would like to discuss this proposal, please don't hesitate to reach out.

Best regards,
VSuite HQ Team
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #007BFF; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .proposal-card { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007BFF; }
            .proposal-title { font-size: 20px; font-weight: bold; color: #007BFF; margin-bottom: 10px; }
            .cta-button { 
                background-color: #007BFF; 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block; 
                margin: 25px 0; 
                font-weight: bold;
                text-align: center;
            }
            .footer { background-color: #f1f3f4; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            .features { margin: 20px 0; }
            .feature { margin: 10px 0; padding-left: 20px; position: relative; }
            .feature:before { content: "✓"; position: absolute; left: 0; color: #28a745; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>VSuite HQ</h1>
                <p>Simplified Workflow Hub</p>
            </div>
            <div class="content">
                <h2>Hello ${clientName || 'Valued Client'},</h2>
                <p>${customMessage || 'We are pleased to present our proposal for your review.'}</p>
                
                <div class="proposal-card">
                    <div class="proposal-title">${proposalTitle}</div>
                    <div class="features">
                        <div class="feature">Detailed project scope and timeline</div>
                        <div class="feature">Transparent pricing breakdown</div>
                        <div class="feature">Clear deliverables and milestones</div>
                        <div class="feature">Terms and conditions</div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${proposalUrl}" class="cta-button">View Your Proposal</a>
                </div>
                
                <p>This proposal link will remain active and you can review it at any time. If you have any questions or would like to discuss this proposal, please don't hesitate to reach out.</p>
                
                <p>Thank you for considering our services.</p>
                
                <p>Best regards,<br>
                VSuite HQ Team</p>
            </div>
            <div class="footer">
                <p>This email was sent from VSuite HQ - Simplified Workflow Hub</p>
                <p>Professional project management and client collaboration platform</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailParams: EmailParams = {
    to: clientEmail,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent,
  };

  // Add PDF attachment if provided
  if (pdfAttachment) {
    emailParams.attachments = [{
      content: pdfAttachment,
      filename: `${proposalTitle.replace(/[^a-zA-Z0-9]/g, '_')}-proposal.pdf`,
      type: 'application/pdf',
      disposition: 'attachment'
    }];
  }

  return await sendEmail(emailParams);
}

// Send invoice via email with PDF attachment
export async function sendInvoiceEmail(
  clientEmail: string,
  invoiceData: any,
  pdfAttachment?: Buffer,
  customMessage: string = '',
  fromEmail: string = 'dustinsparks@mac.com'
): Promise<boolean> {
  const subject = `Invoice: ${invoiceData.invoiceNumber || invoiceData.id}`;
  
  const textContent = `
Dear ${invoiceData.clientName || 'Valued Client'},

${customMessage || 'Thank you for your business! Please find your invoice attached.'}

Invoice Details:
- Invoice #: ${invoiceData.invoiceNumber || invoiceData.id}
- Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}
- Amount: $${parseFloat(invoiceData.totalAmount || 0).toFixed(2)}
${invoiceData.dueDate ? `- Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}` : ''}

Payment Terms: ${invoiceData.terms || 'Payment is due within 30 days of invoice date.'}

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
VSuite HQ Team
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #007BFF; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .invoice-card { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007BFF; }
            .invoice-details { display: flex; justify-content: space-between; margin: 15px 0; }
            .invoice-details .label { font-weight: bold; color: #007BFF; }
            .amount-highlight { font-size: 24px; font-weight: bold; color: #007BFF; text-align: center; margin: 20px 0; }
            .payment-terms { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .footer { background-color: #f1f3f4; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>VSuite HQ</h1>
                <p>Simplified Workflow Hub</p>
            </div>
            <div class="content">
                <h2>Hello ${invoiceData.clientName || 'Valued Client'},</h2>
                <p>${customMessage || 'Thank you for your business! Please find your invoice details below.'}</p>
                
                <div class="invoice-card">
                    <h3 style="color: #007BFF; margin-top: 0;">Invoice Details</h3>
                    <div class="invoice-details">
                        <span class="label">Invoice #:</span>
                        <span>${invoiceData.invoiceNumber || invoiceData.id}</span>
                    </div>
                    <div class="invoice-details">
                        <span class="label">Date:</span>
                        <span>${new Date(invoiceData.createdAt).toLocaleDateString()}</span>
                    </div>
                    ${invoiceData.dueDate ? `
                    <div class="invoice-details">
                        <span class="label">Due Date:</span>
                        <span>${new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                    ${invoiceData.projectDescription ? `
                    <div class="invoice-details">
                        <span class="label">Project:</span>
                        <span>${invoiceData.projectDescription}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="amount-highlight">
                    Total Amount: $${parseFloat(invoiceData.totalAmount || 0).toFixed(2)}
                </div>
                
                <div class="payment-terms">
                    <h4 style="margin-top: 0; color: #856404;">Payment Terms</h4>
                    <p style="margin-bottom: 0;">${invoiceData.terms || 'Payment is due within 30 days of invoice date.'}</p>
                </div>
                
                <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
                
                <p>Thank you for your business!</p>
                
                <p>Best regards,<br>
                VSuite HQ Team</p>
            </div>
            <div class="footer">
                <p>This invoice was sent from VSuite HQ - Simplified Workflow Hub</p>
                <p>Professional project management and client collaboration platform</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailParams: EmailParams = {
    to: clientEmail,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent,
  };

  // Add PDF attachment if provided
  if (pdfAttachment) {
    emailParams.attachments = [{
      content: pdfAttachment,
      filename: `invoice-${invoiceData.invoiceNumber || invoiceData.id}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment'
    }];
  }

  return await sendEmail(emailParams);
}

export async function sendHighPriorityTaskNotification(
  task: Task, 
  assignedUser: User,
  fromEmail: string = 'dustinsparks@mac.com'
): Promise<boolean> {
  if (!assignedUser.emailOptIn || !assignedUser.notificationEmail) {
    console.log(`User ${assignedUser.username} has email notifications disabled or no notification email set`);
    return false;
  }

  const subject = "You've Received a High Priority Task";
  
  const taskUrl = `${APP_URL}/?task=${task.id}`;
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const textContent = `
You've Received a High Priority Task

Task Details:
- Description: ${task.description}
- Priority: ${task.priority.toUpperCase()}
- Due Date: ${formatDate(task.dueDate)}
- Project: ${task.project?.name || 'No project assigned'}
- Status: ${task.completed ? 'Completed' : 'Pending'}

${task.notes ? `Notes: ${task.notes}` : ''}

${task.attachments && task.attachments.length > 0 ? `Attachments: ${task.attachments.join(', ')}` : ''}

${task.links && task.links.length > 0 ? `Links:\n${task.links.map(link => `- ${link}`).join('\n')}` : ''}

Click here to view your tasks in VSuite HQ: ${taskUrl}

Best regards,
VSuite HQ Team
  `.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .task-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .priority-badge { background-color: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .cta-button { background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { background-color: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .links-section { margin-top: 15px; }
            .links-section a { color: #2563eb; word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 High Priority Task Assigned</h1>
                <p>You've received a new high priority task in VSuite HQ</p>
            </div>
            
            <div class="content">
                <div class="task-details">
                    <h2>${task.description}</h2>
                    <p><strong>Priority:</strong> <span class="priority-badge">${task.priority.toUpperCase()}</span></p>
                    <p><strong>Due Date:</strong> ${formatDate(task.dueDate)}</p>
                    <p><strong>Project:</strong> ${task.project?.name || 'No project assigned'}</p>
                    <p><strong>Status:</strong> ${task.completed ? '✅ Completed' : '⏳ Pending'}</p>
                    
                    ${task.notes ? `
                    <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <strong>📝 Notes:</strong><br>
                        ${task.notes.replace(/\n/g, '<br>')}
                    </div>
                    ` : ''}
                    
                    ${task.attachments && task.attachments.length > 0 ? `
                    <div style="margin-top: 15px;">
                        <strong>📎 Attachments:</strong><br>
                        ${task.attachments.map(att => `<span style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block;">${att}</span>`).join('')}
                    </div>
                    ` : ''}
                    
                    ${task.links && task.links.length > 0 ? `
                    <div class="links-section">
                        <strong>🔗 Related Links:</strong><br>
                        ${task.links.map(link => `<a href="${link}" target="_blank">${link}</a><br>`).join('')}
                    </div>
                    ` : ''}
                </div>
                
                <div style="text-align: center;">
                    <a href="${taskUrl}" class="cta-button">📋 View in VSuite HQ</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    This is an automated notification from VSuite HQ. You're receiving this because you have email notifications enabled for high priority tasks.
                </p>
            </div>
            
            <div class="footer">
                <p>VSuite HQ - Simplified Workflow Hub</p>
                <p style="font-size: 12px; opacity: 0.8;">
                    To manage your notification preferences, log in to VSuite HQ and visit your account settings.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: assignedUser.notificationEmail,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent
  });
}

export async function sendSMSNotification(
  task: Task, 
  assignedUser: User,
  fromPhoneNumber: string = process.env.TWILIO_PHONE_NUMBER || ''
): Promise<boolean> {
  if (!assignedUser.smsOptIn || !assignedUser.phone) {
    console.log(`User ${assignedUser.username} has SMS notifications disabled or no phone number set`);
    return false;
  }

  const message = `High priority task '${task.description}' assigned to you. Check VSuite HQ for details.`;
  
  if (!twilioClient || !fromPhoneNumber) {
    console.log(`📱 SMS notification would be sent to ${assignedUser.phone}:`);
    console.log(`   "${message}"`);
    console.log(`   (SMS disabled: Twilio integration not configured)`);
    return true; // Return true for logging purposes
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: assignedUser.phone
    });
    console.log(`📱 SMS sent successfully to ${assignedUser.phone}`);
    return true;
  } catch (error: any) {
    console.error('Twilio SMS error:', error);
    if (error.code === 20003) {
      console.log('💡 Tip: Check that your Auth Token is correct and phone number is verified for trial accounts');
    }
    return false;
  }
}