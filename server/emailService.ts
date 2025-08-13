import { MailService } from '@sendgrid/mail';
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

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const SENDGRID_KEY = process.env.SENDGRID_API_KEY_2 || process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_KEY || !SENDGRID_KEY.startsWith('SG.')) {
    console.log("📧 Email notification would be sent:", params.subject, "to", params.to);
    console.log("   (Email disabled: SendGrid API key not configured properly)");
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
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
  assignedUser: User
): Promise<boolean> {
  // SMS functionality would require Twilio integration
  // For now, we'll just log that an SMS would be sent
  if (!assignedUser.smsOptIn || !assignedUser.phone) {
    console.log(`User ${assignedUser.username} has SMS notifications disabled or no phone number set`);
    return false;
  }

  console.log(`📱 SMS notification would be sent to ${assignedUser.phone}:`);
  console.log(`   "High priority task '${task.description}' assigned to you. Check VSuite HQ for details."`);
  console.log(`   (SMS disabled: Twilio integration not configured)`);
  
  // TODO: Implement Twilio SMS sending
  // This would require TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
  
  return true;
}