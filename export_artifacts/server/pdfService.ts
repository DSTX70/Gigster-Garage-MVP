import puppeteer, { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

let browser: Browser | null = null;
let browserHealthy = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

// HTML escaping utility to prevent HTML injection attacks
function escapeHtml(unsafe: string | undefined | null): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// URL validation utility for payment links
function isValidPaymentUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    // Allow common payment processors and secure domains
    const allowedDomains = [
      'stripe.com',
      'checkout.stripe.com',
      'paypal.com',
      'sandbox.paypal.com',
      'square.com',
      'squareup.com',
      'checkout.square.com',
      // Add your own domain(s) for custom payment processing
      'localhost', // For development
      '127.0.0.1',  // For development
      'replit.dev', // Allow Replit domains
      'replit.com'  // Allow Replit domains
    ];
    
    // Must be HTTPS (except localhost and Replit for development)
    if (parsedUrl.protocol !== 'https:' && 
        !parsedUrl.hostname.includes('localhost') && 
        parsedUrl.hostname !== '127.0.0.1' &&
        !parsedUrl.hostname.includes('replit.dev')) {
      return false;
    }
    
    // Check if domain is in allowed list
    return allowedDomains.some(domain => 
      parsedUrl.hostname === domain || 
      parsedUrl.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// Timeout wrapper for async operations
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// Check browser health
async function checkBrowserHealth(): Promise<boolean> {
  if (!browser) return false;
  
  try {
    // Simple health check - try to get browser version
    const version = await browser.version();
    return version !== null;
  } catch {
    return false;
  }
}

// Initialize browser instance with timeout and error handling
async function getBrowser(): Promise<Browser> {
  const now = Date.now();
  
  // Check browser health periodically
  if (browser && (now - lastHealthCheck > HEALTH_CHECK_INTERVAL || !browserHealthy)) {
    browserHealthy = await checkBrowserHealth();
    lastHealthCheck = now;
    
    if (!browserHealthy) {
      console.log('Browser unhealthy, closing and recreating...');
      try {
        await browser.close();
      } catch (error) {
        console.log('Error closing unhealthy browser:', error);
      }
      browser = null;
    }
  }
  
  if (!browser) {
    try {
      console.log('Launching new browser instance...');
      browser = await withTimeout(
        puppeteer.launch({
          headless: true,
          executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-extensions'
          ]
        }),
        30000 // 30 second timeout for browser launch
      );
      
      browserHealthy = true;
      lastHealthCheck = now;
      console.log('Browser launched successfully');
      
      // Handle browser disconnect
      browser.on('disconnected', () => {
        console.log('Browser disconnected, marking as unhealthy');
        browserHealthy = false;
        browser = null;
      });
      
    } catch (error) {
      console.error('Failed to launch browser:', error);
      browser = null;
      browserHealthy = false;
      throw new Error(`Failed to initialize PDF browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return browser;
}

// Modern PDF generation with no deprecated methods
export async function generatePDFFromHTML(
  htmlContent: string,
  options: {
    filename?: string;
    format?: 'A4' | 'Letter';
    margin?: { top: string; right: string; bottom: string; left: string };
  } = {},
  retries = 2
): Promise<Buffer> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    let browserInstance: Browser | null = null;
    let page: Page | null = null;
    
    try {
      console.log(`🔄 PDF generation attempt ${attempt + 1}/${retries + 1}`);
      
      // Get browser instance with modern timeout handling
      browserInstance = await getBrowser();
      
      // Create page with modern timeout wrapper
      page = await withTimeout(
        browserInstance.newPage(),
        15000 // Increased timeout for page creation
      );
      
      // Configure page with optimal settings
      await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
      
      // Set modern user agent to avoid rendering issues
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
      
      // Set content with modern wait strategy - using domcontentloaded is sufficient
      console.log('🔄 Loading HTML content...');
      await withTimeout(
        page.setContent(htmlContent, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000
        }),
        35000 // Timeout for content loading
      );
      
      // Modern way to wait for content to settle - using standard setTimeout
      console.log('🔄 Waiting for content to stabilize...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Slightly longer wait for stability
      
      // Ensure fonts are loaded by checking document readiness
      try {
        await page.evaluate(() => {
          return new Promise<void>((resolve) => {
            if (document.readyState === 'complete') {
              resolve();
            } else {
              window.addEventListener('load', () => resolve());
            }
          });
        });
      } catch (evalError) {
        console.log('Font loading check failed, proceeding:', evalError);
      }
      
      // Generate PDF with modern settings and extended timeout
      console.log('🔄 Generating PDF...');
      const pdfBuffer = await withTimeout(
        page.pdf({
          format: options.format || 'A4',
          margin: options.margin || { top: '1in', right: '0.75in', bottom: '1in', left: '0.75in' },
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: false,
          headerTemplate: '',
          footerTemplate: '',
          timeout: 60000 // Extended internal timeout
        }),
        65000 // Extended wrapper timeout for PDF generation
      );
      
      console.log('✅ PDF generated successfully');
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ PDF generation attempt ${attempt + 1} failed:`, lastError.message);
      
      // Enhanced error detection and browser reset logic
      const isBrowserError = lastError.message.includes('Protocol error') || 
          lastError.message.includes('Connection closed') ||
          lastError.message.includes('Target closed') ||
          lastError.message.includes('Session closed') ||
          lastError.message.includes('Browser closed');
      
      if (attempt < retries && isBrowserError) {
        console.log('🔄 Browser connection error detected, resetting browser for retry...');
        browserHealthy = false;
        if (browser) {
          try {
            await browser.close();
          } catch (closeError) {
            console.log('Error closing browser for retry:', closeError);
          }
          browser = null;
        }
        // Progressive backoff delay
        const delayMs = 1000 * (attempt + 1);
        console.log(`⏳ Waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.log('Warning: Failed to close page:', closeError);
        }
      }
    }
  }
  
  // Enhanced error reporting
  const errorMessage = lastError?.message || 'Unknown error';
  console.error(`💥 PDF generation failed completely after ${retries + 1} attempts:`, errorMessage);
  throw new Error(`PDF generation failed after ${retries + 1} attempts: ${errorMessage}`);
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
        
        <div class="proposal-title">${escapeHtml(proposal.title)}</div>
        
        <div class="client-info">
            <h3>Prepared For:</h3>
            <p><strong>Client:</strong> ${escapeHtml(proposal.clientName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(proposal.clientEmail)}</p>
            <p><strong>Date:</strong> ${new Date(proposal.createdAt).toLocaleDateString()}</p>
            ${proposal.expiresAt ? `<p><strong>Valid Until:</strong> ${new Date(proposal.expiresAt).toLocaleDateString()}</p>` : ''}
        </div>
        
        <div class="content-section">
            ${escapeHtml(proposal.content || '')}
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
export async function generateContractPDF(contract: any): Promise<Buffer> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                margin: 1in 0.75in;
                @top-center {
                    content: "Gigster Garage - Contract";
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
                background-color: #004C6D;
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
            
            .contract-title {
                font-size: 28px;
                font-weight: bold;
                color: #004C6D;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .parties-section {
                background-color: #f8f9fa;
                padding: 25px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #004C6D;
            }
            
            .parties-section h3 {
                color: #004C6D;
                margin-top: 0;
            }
            
            .content-section {
                margin-bottom: 40px;
            }
            
            .content-section h2 {
                color: #004C6D;
                border-bottom: 2px solid #004C6D;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            
            .signature-section {
                margin-top: 60px;
                padding-top: 40px;
                border-top: 2px solid #004C6D;
                display: flex;
                justify-content: space-between;
            }
            
            .signature-block {
                width: 45%;
                text-align: center;
            }
            
            .signature-line {
                border-bottom: 1px solid #333;
                margin-bottom: 10px;
                height: 40px;
            }
            
            .footer {
                margin-top: 60px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Gigster Garage</h1>
            <div class="tagline">Simplified Workflow Hub</div>
        </div>

        <div class="contract-title">
            ${escapeHtml(contract.contractTitle || 'Service Contract')}
        </div>

        <div class="parties-section">
            <h3>Contract Parties</h3>
            <p><strong>Service Provider:</strong> Gigster Garage</p>
            <p><strong>Client:</strong> ${escapeHtml(contract.clientName || 'Client Name')}</p>
            <p><strong>Date:</strong> ${escapeHtml(contract.contractDate || new Date().toLocaleDateString())}</p>
            <p><strong>Contract Value:</strong> $${escapeHtml(contract.contractValue?.toString() || '0')}</p>
        </div>

        ${contract.scope ? `
        <div class="content-section">
            <h2>Scope of Work</h2>
            <div>${escapeHtml(contract.scope).replace(/\\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${contract.deliverables ? `
        <div class="content-section">
            <h2>Deliverables</h2>
            <div>${escapeHtml(contract.deliverables).replace(/\\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${contract.paymentTerms ? `
        <div class="content-section">
            <h2>Payment Terms</h2>
            <div>${escapeHtml(contract.paymentTerms).replace(/\\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${contract.responsibilities ? `
        <div class="content-section">
            <h2>Responsibilities</h2>
            <div>${escapeHtml(contract.responsibilities).replace(/\\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${contract.legalTerms ? `
        <div class="content-section">
            <h2>Legal Terms</h2>
            <div>${escapeHtml(contract.legalTerms).replace(/\\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${contract.confidentiality ? `
        <div class="content-section">
            <h2>Confidentiality</h2>
            <div>${escapeHtml(contract.confidentiality).replace(/\\n/g, '<br>')}</div>
        </div>
        ` : ''}

        <div class="signature-section">
            <div class="signature-block">
                <div class="signature-line"></div>
                <p><strong>Client Signature</strong></p>
                <p>${escapeHtml(contract.clientName || 'Client Name')}</p>
                <p>Date: _______________</p>
            </div>
            <div class="signature-block">
                <div class="signature-line"></div>
                <p><strong>Service Provider</strong></p>
                <p>Gigster Garage</p>
                <p>Date: _______________</p>
            </div>
        </div>

        <div class="footer">
            <p>This contract is governed by applicable laws and regulations.</p>
            <p>Generated by Gigster Garage - Simplified Workflow Hub</p>
        </div>
    </body>
    </html>
  `;

  return await generatePDFFromHTML(htmlContent, { 
    filename: `contract-${contract.id}.pdf`,
    format: 'A4'
  });
}

export async function generatePresentationPDF(presentation: any): Promise<Buffer> {
  const slides = Array.isArray(presentation.slides) ? presentation.slides.sort((a: any, b: any) => a.order - b.order) : [];
  
  const slidesHtml = slides.map((slide: any, index: number) => {
    const isLastSlide = index === slides.length - 1;
    const pageBreakStyle = isLastSlide ? '' : 'page-break-after: always;';
    
    if (slide.slideType === 'title' && index === 0) {
      return `
        <div class="slide title-slide" style="${pageBreakStyle}">
          <div class="slide-content">
            <h1 class="presentation-title">${escapeHtml(presentation.title || 'Presentation Title')}</h1>
            ${presentation.subtitle ? `<h2 class="presentation-subtitle">${escapeHtml(presentation.subtitle)}</h2>` : ''}
            <div class="author-info">
              ${presentation.author ? `<p class="author">${escapeHtml(presentation.author)}</p>` : ''}
              ${presentation.company ? `<p class="company">${escapeHtml(presentation.company)}</p>` : ''}
              ${presentation.date ? `<p class="date">${escapeHtml(presentation.date)}</p>` : ''}
            </div>
          </div>
          <div class="slide-number">${index + 1} / ${slides.length}</div>
        </div>
      `;
    } else {
      return `
        <div class="slide" style="${pageBreakStyle}">
          <div class="slide-content">
            <h2 class="slide-title">${escapeHtml(slide.title || 'Slide Title')}</h2>
            <div class="slide-text">${escapeHtml(slide.content || 'Slide content goes here...').replace(/\\n/g, '<br>')}</div>
          </div>
          <div class="slide-number">${index + 1} / ${slides.length}</div>
        </div>
      `;
    }
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                margin: 0.5in;
                size: A4;
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
            }
            
            .slide {
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                padding: 60px;
                box-sizing: border-box;
                background: white;
            }
            
            .title-slide {
                background: linear-gradient(135deg, #004C6D 0%, #0B1D3A 100%);
                color: white;
                text-align: center;
            }
            
            .slide-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: 100%;
                max-width: 800px;
            }
            
            .presentation-title {
                font-size: 48px;
                font-weight: bold;
                margin: 0 0 20px 0;
                line-height: 1.2;
            }
            
            .presentation-subtitle {
                font-size: 24px;
                margin: 0 0 40px 0;
                opacity: 0.9;
                font-weight: normal;
            }
            
            .author-info {
                margin-top: 60px;
            }
            
            .author-info p {
                margin: 10px 0;
                font-size: 18px;
            }
            
            .author {
                font-weight: bold;
                font-size: 24px;
            }
            
            .company {
                font-size: 20px;
                opacity: 0.8;
            }
            
            .date {
                font-size: 16px;
                opacity: 0.7;
            }
            
            .slide-title {
                font-size: 36px;
                font-weight: bold;
                color: #004C6D;
                margin: 0 0 40px 0;
                line-height: 1.2;
            }
            
            .slide-text {
                font-size: 18px;
                line-height: 1.6;
                color: #333;
            }
            
            .slide-number {
                position: absolute;
                bottom: 20px;
                right: 20px;
                font-size: 14px;
                color: #666;
            }
            
            .title-slide .slide-number {
                color: rgba(255, 255, 255, 0.7);
            }
        </style>
    </head>
    <body>
        ${slidesHtml}
    </body>
    </html>
  `;

  return await generatePDFFromHTML(htmlContent, { 
    filename: `presentation-${presentation.id}.pdf`,
    format: 'A4'
  });
}

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
            
            .payment-section {
                clear: both;
                margin-top: 40px;
                padding: 30px;
                background: linear-gradient(135deg, #007BFF 0%, #0056b3 100%);
                border-radius: 10px;
                text-align: center;
                color: white;
                box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
            }
            
            .payment-section h3 {
                margin: 0 0 15px 0;
                font-size: 24px;
                font-weight: bold;
            }
            
            .payment-section p {
                margin: 0 0 25px 0;
                font-size: 16px;
                opacity: 0.9;
            }
            
            .pay-now-button {
                display: inline-block;
                background: white;
                color: #007BFF;
                padding: 15px 40px;
                border-radius: 50px;
                text-decoration: none;
                font-weight: bold;
                font-size: 18px;
                border: 3px solid white;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            
            .pay-now-button:hover {
                background: #f8f9fa;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            }
            
            .payment-expiry {
                margin-top: 15px;
                font-size: 14px;
                opacity: 0.8;
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
                <p><strong>Invoice #:</strong> ${escapeHtml(invoice.invoiceNumber || invoice.id)}</p>
                <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
                ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
            </div>
        </div>
        
        <div class="client-section">
            <div class="client-details">
                <h3>Bill To:</h3>
                <p><strong>${escapeHtml(invoice.clientName)}</strong></p>
                <p>${escapeHtml(invoice.clientEmail)}</p>
                ${invoice.clientAddress ? `<p>${escapeHtml(invoice.clientAddress)}</p>` : ''}
            </div>
            <div class="invoice-details">
                <h3>Invoice Details:</h3>
                <p><strong>Project:</strong> ${escapeHtml(invoice.projectDescription || 'Professional Services')}</p>
                <p><strong>Status:</strong> ${escapeHtml(invoice.status)}</p>
                ${invoice.terms ? `<p><strong>Terms:</strong> ${escapeHtml(invoice.terms)}</p>` : ''}
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
                        <td>${escapeHtml(item.description || 'Service')}</td>
                        <td style="text-align: center;">${parseFloat(item.quantity || 1).toFixed(0)}</td>
                        <td class="amount-cell">$${parseFloat(item.rate || 0).toFixed(2)}</td>
                        <td class="amount-cell">$${parseFloat(item.amount || 0).toFixed(2)}</td>
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
            <p>${escapeHtml(invoice.terms || 'Payment is due within 30 days of invoice date.')}</p>
            <p>Thank you for your business!</p>
        </div>
        
        ${(invoice.paymentUrl || invoice.paymentLink) && isValidPaymentUrl(invoice.paymentUrl || invoice.paymentLink) ? `
        <div class="payment-section">
            <h3>💳 Pay Your Invoice Online</h3>
            <p>Click the button below to securely pay your invoice online using our secure payment portal.</p>
            <a href="${escapeHtml(invoice.paymentUrl || invoice.paymentLink)}" class="pay-now-button">
                Pay Now - $${parseFloat(invoice.totalAmount || 0).toFixed(2)}
            </a>
            ${invoice.paymentLinkExpiresAt ? `
            <div class="payment-expiry">
                Payment link expires: ${new Date(invoice.paymentLinkExpiresAt).toLocaleDateString()} at ${new Date(invoice.paymentLinkExpiresAt).toLocaleTimeString()}
            </div>
            ` : ''}
        </div>
        ` : (invoice.paymentUrl || invoice.paymentLink) ? `
        <div class="payment-terms">
            <h3>⚠️ Invalid Payment Link</h3>
            <p>The payment link provided is not from a recognized secure payment provider. Please contact us for alternative payment methods.</p>
        </div>
        ` : ''}
        
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
    try {
      await browser.close();
    } catch (error) {
      console.log('Error closing browser:', error);
    } finally {
      browser = null;
      browserHealthy = false;
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await closeBrowser();
});

process.on('SIGINT', async () => {
  await closeBrowser();
});