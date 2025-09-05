import { storage } from "./storage";
import { sendEmail } from "./emailService";
import type { Proposal } from "@shared/schema";

/**
 * Proposal Workflow Service
 * Handles proposal approval workflow, revisions, and notifications
 */

/**
 * Send notification email to business owner when client responds to proposal
 */
export async function sendProposalResponseNotification(
  proposal: Proposal, 
  response: string, 
  clientMessage?: string
): Promise<boolean> {
  try {
    // Get proposal creator for notification
    let notificationEmail = 'team@gigstergarage.com'; // Default
    
    if (proposal.createdById) {
      const creator = await storage.getUser(proposal.createdById);
      if (creator?.email) {
        notificationEmail = creator.email;
      }
    }

    // Format response type for display
    const responseDisplayMap: Record<string, string> = {
      'accepted': '✅ ACCEPTED',
      'rejected': '❌ REJECTED', 
      'revision_requested': '🔄 REVISION REQUESTED'
    };

    const responseDisplay = responseDisplayMap[response] || response.toUpperCase();
    const subject = `Proposal Response: ${responseDisplay} - ${proposal.title}`;
    
    const textContent = `
PROPOSAL RESPONSE RECEIVED

Client Response: ${responseDisplay}
Proposal: ${proposal.title}
Client: ${proposal.clientName || 'Unknown Client'}
Email: ${proposal.clientEmail || 'No email provided'}
Response Date: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

${clientMessage ? `Client Message:\n"${clientMessage}"\n` : ''}

${response === 'revision_requested' ? 
  'ACTION REQUIRED: The client has requested revisions. Please review their feedback and create an updated proposal version.' :
  response === 'accepted' ?
  'CONGRATULATIONS! The client has accepted your proposal. You can now proceed with project setup and invoicing.' :
  'The client has declined this proposal. Consider following up or creating a revised proposal if appropriate.'
}

View full proposal details in your Gigster Garage dashboard.

Best regards,
Gigster Garage System
    `.trim();

    const htmlContent = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${
          response === 'accepted' ? '#d4edda' : 
          response === 'rejected' ? '#f8d7da' : 
          '#fff3cd'
        }; border: 1px solid ${
          response === 'accepted' ? '#c3e6cb' : 
          response === 'rejected' ? '#f5c6cb' : 
          '#ffeaa7'
        }; color: ${
          response === 'accepted' ? '#155724' : 
          response === 'rejected' ? '#721c24' : 
          '#856404'
        }; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin: 0;">${responseDisplay}</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Proposal Response Received</p>
        </div>
        
        <div style="background: #f8f9fa; border-left: 4px solid #004C6D; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #004C6D;">Proposal Details</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Proposal:</strong> ${proposal.title}</li>
            <li><strong>Client:</strong> ${proposal.clientName || 'Unknown Client'}</li>
            <li><strong>Email:</strong> ${proposal.clientEmail || 'No email provided'}</li>
            <li><strong>Response Date:</strong> ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</li>
          </ul>
        </div>
        
        ${clientMessage ? `
        <div style="background: #e9ecef; border-left: 4px solid #6c757d; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #495057;">Client Message</h4>
          <p style="margin: 0; font-style: italic;">"${clientMessage}"</p>
        </div>
        ` : ''}
        
        <div style="background: ${
          response === 'accepted' ? '#d1ecf1' : 
          response === 'rejected' ? '#f2dede' : 
          '#fcf8e3'
        }; border: 1px solid ${
          response === 'accepted' ? '#bee5eb' : 
          response === 'rejected' ? '#ebccd1' : 
          '#faebcc'
        }; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">
            ${response === 'revision_requested' ? '⚡ Action Required' :
              response === 'accepted' ? '🎉 Next Steps' :
              '💡 Suggested Actions'}
          </h4>
          <p style="margin: 0;">
            ${response === 'revision_requested' ? 
              'The client has requested revisions. Please review their feedback and create an updated proposal version.' :
              response === 'accepted' ?
              'Congratulations! The client has accepted your proposal. You can now proceed with project setup and invoicing.' :
              'The client has declined this proposal. Consider following up or creating a revised proposal if appropriate.'
            }
          </p>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px;">
          <p style="margin: 0;"><strong>Access your dashboard</strong><br>
          View full proposal details and manage your workflow in your Gigster Garage dashboard.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const emailSent = await sendEmail({
      to: notificationEmail,
      from: 'proposals@gigstergarage.com',
      subject,
      text: textContent,
      html: htmlContent
    });

    if (emailSent) {
      console.log(`📧 Proposal response notification sent for "${proposal.title}" (${response}) to ${notificationEmail}`);
    } else {
      console.log(`❌ Failed to send proposal response notification for "${proposal.title}"`);
    }

    return emailSent;
  } catch (error) {
    console.error(`❌ Error sending proposal response notification:`, error);
    return false;
  }
}

/**
 * Create a new proposal version for revision requests
 */
export async function createProposalRevision(
  originalProposal: Proposal,
  revisionNotes?: string
): Promise<Proposal> {
  try {
    const newVersion = originalProposal.version + 1;
    
    // Create new proposal as revision
    const revisionProposal = await storage.createProposal({
      title: `${originalProposal.title} (v${newVersion})`,
      templateId: originalProposal.templateId,
      projectId: originalProposal.projectId,
      clientId: originalProposal.clientId,
      clientName: originalProposal.clientName,
      clientEmail: originalProposal.clientEmail,
      status: 'draft',
      content: originalProposal.content,
      variables: originalProposal.variables,
      projectDescription: originalProposal.projectDescription,
      totalBudget: originalProposal.totalBudget,
      timeline: originalProposal.timeline,
      deliverables: originalProposal.deliverables,
      terms: originalProposal.terms,
      lineItems: originalProposal.lineItems,
      calculatedTotal: originalProposal.calculatedTotal,
      expiresInDays: originalProposal.expiresInDays,
      version: newVersion,
      parentProposalId: originalProposal.id,
      createdById: originalProposal.createdById,
      metadata: {
        ...originalProposal.metadata,
        revisionReason: 'client_requested',
        revisionNotes: revisionNotes || '',
        originalProposalId: originalProposal.id
      }
    });

    console.log(`📝 Created proposal revision v${newVersion} for "${originalProposal.title}"`);
    return revisionProposal;
  } catch (error) {
    console.error('❌ Error creating proposal revision:', error);
    throw error;
  }
}

/**
 * Get proposal approval workflow statistics
 */
export async function getProposalApprovalStats(): Promise<{
  totalProposals: number;
  awaitingResponse: number;
  accepted: number;
  rejected: number;
  revisionRequested: number;
  expired: number;
  acceptanceRate: number;
}> {
  try {
    const proposals = await storage.getProposals();
    
    const stats = {
      totalProposals: proposals.length,
      awaitingResponse: proposals.filter(p => ['sent', 'viewed'].includes(p.status)).length,
      accepted: proposals.filter(p => p.status === 'accepted').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      revisionRequested: proposals.filter(p => p.status === 'revision_requested').length,
      expired: proposals.filter(p => p.status === 'expired').length,
      acceptanceRate: 0
    };

    // Calculate acceptance rate (excluding drafts and pending responses)
    const respondedProposals = stats.accepted + stats.rejected + stats.revisionRequested;
    if (respondedProposals > 0) {
      stats.acceptanceRate = Math.round((stats.accepted / respondedProposals) * 100);
    }

    return stats;
  } catch (error) {
    console.error('❌ Error calculating proposal approval stats:', error);
    throw error;
  }
}