import puppeteer, { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

let browser: Browser | null = null;

// Initialize browser instance
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return browser;
}

// Generate PDF from HTML content
export async function generatePDFFromHTML(
  htmlContent: string,
  options: {
    filename?: string;
    format?: 'A4' | 'Letter';
    margin?: { top: string; right: string; bottom: string; left: string };
  } = {}
): Promise<Buffer> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  
  try {
    // Set content with proper styling
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      margin: options.margin || { top: '1in', right: '0.75in', bottom: '1in', left: '0.75in' },
      printBackground: true,
      preferCSSPageSize: true,
    });
    
    return pdfBuffer;
  } finally {
    await page.close();
  }
}

// Generate proposal PDF
export async function generateProposalPDF(proposal: any): Promise<Buffer> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                margin: 1in 0.75in;
                @top-center {
                    content: "Gigster Garage - Simplified Workflow Hub";
                    font-size: 10px;
                    color: #666;
                }
                @bottom-center {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10px;
                    color: #666;
                }
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            
            .header {
                background-color: #007BFF;
                color: white;
                padding: 40px 30px;
                text-align: center;
                margin-bottom: 40px;
            }
            
            .header h1 {
                margin: 0;
                font-size: 32px;
                font-weight: bold;
            }
            
            .header .tagline {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }
            
            .proposal-title {
                font-size: 28px;
                font-weight: bold;
                color: #007BFF;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .client-info {
                background-color: #f8f9fa;
                padding: 25px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #007BFF;
            }
            
            .client-info h3 {
                color: #007BFF;
                margin-top: 0;
            }
            
            .content-section {
                margin-bottom: 40px;
            }
            
            .content-section h2 {
                color: #007BFF;
                border-bottom: 2px solid #007BFF;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            
            .pricing-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background-color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .pricing-table th {
                background-color: #007BFF;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
            }
            
            .pricing-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
            }
            
            .pricing-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .total-row {
                background-color: #007BFF !important;
                color: white;
                font-weight: bold;
            }
            
            .footer {
                margin-top: 60px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            
            .page-break {
                page-break-before: always;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Gigster Garage</h1>
            <div class="tagline">Simplified Workflow Hub</div>
        </div>
        
        <div class="proposal-title">${proposal.title}</div>
        
        <div class="client-info">
            <h3>Prepared For:</h3>
            <p><strong>Client:</strong> ${proposal.clientName}</p>
            <p><strong>Email:</strong> ${proposal.clientEmail}</p>
            <p><strong>Date:</strong> ${new Date(proposal.createdAt).toLocaleDateString()}</p>
            ${proposal.expiresAt ? `<p><strong>Valid Until:</strong> ${new Date(proposal.expiresAt).toLocaleDateString()}</p>` : ''}
        </div>
        
        <div class="content-section">
            ${proposal.content || ''}
        </div>
        
        <div class="footer">
            <p><strong>Gigster Garage - Simplified Workflow Hub</strong></p>
            <p>Professional Project Management & Client Collaboration Platform</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
    </body>
    </html>
  `;
  
  return await generatePDFFromHTML(htmlContent, { 
    filename: `proposal-${proposal.id}.pdf`,
    format: 'A4'
  });
}

// Generate invoice PDF
export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                margin: 1in 0.75in;
                @top-center {
                    content: "Gigster Garage - Invoice";
                    font-size: 10px;
                    color: #666;
                }
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 3px solid #007BFF;
            }
            
            .company-info h1 {
                color: #007BFF;
                margin: 0;
                font-size: 32px;
            }
            
            .company-info .tagline {
                color: #666;
                margin: 5px 0 0 0;
            }
            
            .invoice-info {
                text-align: right;
            }
            
            .invoice-info h2 {
                color: #007BFF;
                margin: 0 0 10px 0;
                font-size: 28px;
            }
            
            .client-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }
            
            .client-details, .invoice-details {
                width: 48%;
            }
            
            .client-details h3, .invoice-details h3 {
                color: #007BFF;
                margin-bottom: 15px;
                border-bottom: 1px solid #007BFF;
                padding-bottom: 5px;
            }
            
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                background-color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .invoice-table th {
                background-color: #007BFF;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
            }
            
            .invoice-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
            }
            
            .invoice-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .amount-cell {
                text-align: right;
                font-weight: bold;
            }
            
            .totals-section {
                float: right;
                width: 300px;
                margin-top: 20px;
            }
            
            .total-line {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            
            .total-line.final {
                background-color: #007BFF;
                color: white;
                padding: 15px;
                font-weight: bold;
                font-size: 18px;
                margin-top: 10px;
            }
            
            .payment-terms {
                clear: both;
                margin-top: 40px;
                padding: 20px;
                background-color: #f8f9fa;
                border-left: 4px solid #007BFF;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>Gigster Garage</h1>
                <div class="tagline">Simplified Workflow Hub</div>
            </div>
            <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${invoice.invoiceNumber || invoice.id}</p>
                <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
                ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
            </div>
        </div>
        
        <div class="client-section">
            <div class="client-details">
                <h3>Bill To:</h3>
                <p><strong>${invoice.clientName}</strong></p>
                <p>${invoice.clientEmail}</p>
                ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
            </div>
            <div class="invoice-details">
                <h3>Invoice Details:</h3>
                <p><strong>Project:</strong> ${invoice.projectDescription || 'Professional Services'}</p>
                <p><strong>Status:</strong> ${invoice.status}</p>
                ${invoice.terms ? `<p><strong>Terms:</strong> ${invoice.terms}</p>` : ''}
            </div>
        </div>
        
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Rate</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.lineItems && invoice.lineItems.length > 0 
                  ? invoice.lineItems.map((item: any) => `
                    <tr>
                        <td>${item.description || 'Service'}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td class="amount-cell">$${parseFloat(item.rate).toFixed(2)}</td>
                        <td class="amount-cell">$${parseFloat(item.amount).toFixed(2)}</td>
                    </tr>
                  `).join('')
                  : `
                    <tr>
                        <td>Professional Services</td>
                        <td style="text-align: center;">1</td>
                        <td class="amount-cell">$${parseFloat(invoice.totalAmount || 0).toFixed(2)}</td>
                        <td class="amount-cell">$${parseFloat(invoice.totalAmount || 0).toFixed(2)}</td>
                    </tr>
                  `
                }
            </tbody>
        </table>
        
        <div class="totals-section">
            <div class="total-line">
                <span>Subtotal:</span>
                <span>$${parseFloat(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
            ${invoice.taxAmount ? `
            <div class="total-line">
                <span>Tax:</span>
                <span>$${parseFloat(invoice.taxAmount).toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-line final">
                <span>Total:</span>
                <span>$${parseFloat(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
        </div>
        
        <div class="payment-terms">
            <h3>Payment Terms & Instructions:</h3>
            <p>${invoice.terms || 'Payment is due within 30 days of invoice date.'}</p>
            <p>Thank you for your business!</p>
        </div>
        
        <div class="footer">
            <p><strong>Gigster Garage - Simplified Workflow Hub</strong></p>
            <p>Professional Project Management & Client Collaboration Platform</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
    </body>
    </html>
  `;
  
  return await generatePDFFromHTML(htmlContent, { 
    filename: `invoice-${invoice.id}.pdf`,
    format: 'A4'
  });
}

// Clean up browser instance
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await closeBrowser();
});

process.on('SIGINT', async () => {
  await closeBrowser();
});