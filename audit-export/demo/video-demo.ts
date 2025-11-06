import puppeteer from 'puppeteer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic as string);

interface DemoScene {
  name: string;
  duration: number;
  narration: string;
  action: (page: puppeteer.Page) => Promise<void>;
}

const DEMO_CONFIG = {
  baseUrl: 'http://localhost:5000',
  outputDir: 'attached_assets/demo',
  screenshotsDir: 'attached_assets/demo/screenshots',
  videoFile: 'attached_assets/demo/gigster-garage-demo.mp4',
  fps: 30,
  width: 1920,
  height: 1080,
};

// Helper: Wait and take screenshot
async function captureFrame(page: puppeteer.Page, frameNumber: number) {
  const screenshotPath = path.join(DEMO_CONFIG.screenshotsDir, `frame-${String(frameNumber).padStart(6, '0')}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
}

// Helper: Wait with animation capture
async function waitWithCapture(page: puppeteer.Page, ms: number, startFrame: number): Promise<number> {
  const frames = Math.floor((ms / 1000) * DEMO_CONFIG.fps);
  const interval = ms / frames;
  
  for (let i = 0; i < frames; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));
    await captureFrame(page, startFrame + i);
  }
  
  return startFrame + frames;
}

// Helper: Type with animation
async function typeWithCapture(
  page: puppeteer.Page,
  selector: string,
  text: string,
  startFrame: number
): Promise<number> {
  await page.focus(selector);
  let currentFrame = startFrame;
  
  for (const char of text) {
    await page.keyboard.type(char);
    currentFrame = await waitWithCapture(page, 100, currentFrame);
  }
  
  return currentFrame;
}

// Helper: Click with delay
async function clickWithCapture(
  page: puppeteer.Page,
  selector: string,
  startFrame: number
): Promise<number> {
  await page.click(selector);
  return await waitWithCapture(page, 500, startFrame);
}

// Demo Scenes
const scenes: DemoScene[] = [
  {
    name: 'Welcome & Login',
    duration: 8,
    narration: 'Welcome to Gigster Garage - a comprehensive time tracker and workflow management system. Let\'s log in and explore the platform.',
    action: async (page) => {
      await page.goto(DEMO_CONFIG.baseUrl);
      await page.waitForSelector('input[data-testid="input-email"]', { timeout: 10000 });
      
      let frame = 0;
      frame = await waitWithCapture(page, 2000, frame);
      
      // Type email
      frame = await typeWithCapture(page, 'input[data-testid="input-email"]', 'demo@gigster.com', frame);
      frame = await waitWithCapture(page, 500, frame);
      
      // Type password
      frame = await typeWithCapture(page, 'input[data-testid="input-password"]', 'demo123', frame);
      frame = await waitWithCapture(page, 500, frame);
      
      // Click login
      frame = await clickWithCapture(page, 'button[data-testid="button-login"]', frame);
      
      // Wait for dashboard to appear (SPA navigation)
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
      frame = await waitWithCapture(page, 2000, frame);
    },
  },
  
  {
    name: 'Dashboard Overview',
    duration: 10,
    narration: 'Here\'s your command center. The dashboard shows active tasks, projects, time tracked, and revenue at a glance. You can see all your key metrics and recent activity in one place.',
    action: async (page) => {
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 5000 });
      
      let frame = 0;
      frame = await waitWithCapture(page, 3000, frame);
      
      // Scroll to show metrics
      await page.evaluate(() => window.scrollTo(0, 200));
      frame = await waitWithCapture(page, 2000, frame);
      
      await page.evaluate(() => window.scrollTo(0, 400));
      frame = await waitWithCapture(page, 2000, frame);
      
      await page.evaluate(() => window.scrollTo(0, 0));
      frame = await waitWithCapture(page, 2000, frame);
    },
  },
  
  {
    name: 'Creating a Task',
    duration: 12,
    narration: 'Creating tasks is effortless. Click the Quick Action button in the bottom right, select New Task, and fill in the details. Set the title, choose a project, assign priority, add a due date, and you\'re done.',
    action: async (page) => {
      let frame = 0;
      
      // Click FAB
      const fabSelector = 'button[data-testid="fab-button"]';
      if (await page.$(fabSelector)) {
        frame = await clickWithCapture(page, fabSelector, frame);
        frame = await waitWithCapture(page, 500, frame);
        
        // Click New Task
        const newTaskSelector = 'button[data-testid="fab-new-task"]';
        if (await page.$(newTaskSelector)) {
          frame = await clickWithCapture(page, newTaskSelector, frame);
        }
      } else {
        // Fallback: navigate to tasks
        await page.click('a[href="/tasks"]');
        
        // Wait for tasks page - use data-testid or simple selector
        await page.waitForSelector('button[data-testid="button-new-task"]', { timeout: 5000 });
        frame = await waitWithCapture(page, 1000, frame);
        
        const newTaskBtn = 'button[data-testid="button-new-task"]';
        if (await page.$(newTaskBtn)) {
          frame = await clickWithCapture(page, newTaskBtn, frame);
        }
      }
      
      frame = await waitWithCapture(page, 1000, frame);
      
      // Fill form
      const titleInput = 'input[data-testid="input-task-title"]';
      if (await page.$(titleInput)) {
        frame = await typeWithCapture(page, titleInput, 'Implement video demo feature', frame);
        frame = await waitWithCapture(page, 1000, frame);
        
        // Select priority
        const prioritySelect = 'select[data-testid="select-priority"]';
        if (await page.$(prioritySelect)) {
          await page.select(prioritySelect, 'high');
          frame = await waitWithCapture(page, 1000, frame);
        }
        
        // Submit
        const submitBtn = 'button[data-testid="button-create-task"]';
        if (await page.$(submitBtn)) {
          frame = await clickWithCapture(page, submitBtn, frame);
        }
      }
      
      frame = await waitWithCapture(page, 2000, frame);
    },
  },
  
  {
    name: 'Time Tracking',
    duration: 10,
    narration: 'Time tracking is seamless. Start a timer on any task with one click. The timer runs in the background while you work. When you\'re done, stop it and the time is automatically logged.',
    action: async (page) => {
      // Navigate to tasks
      await page.click('a[href="/tasks"]');
      
      // Wait for tasks page to load - use reliable data-testid
      await page.waitForSelector('button[data-testid="button-new-task"]', { timeout: 5000 });
      
      let frame = 0;
      frame = await waitWithCapture(page, 2000, frame);
      
      // Find and click start timer button
      const startTimerBtn = 'button[data-testid="button-start-timer"]';
      if (await page.$(startTimerBtn)) {
        frame = await clickWithCapture(page, startTimerBtn, frame);
        frame = await waitWithCapture(page, 3000, frame);
        
        // Stop timer
        const stopTimerBtn = 'button[data-testid="button-stop-timer"]';
        if (await page.$(stopTimerBtn)) {
          frame = await clickWithCapture(page, stopTimerBtn, frame);
          frame = await waitWithCapture(page, 2000, frame);
        }
      } else {
        // Just show the tasks page
        frame = await waitWithCapture(page, 5000, frame);
      }
    },
  },
  
  {
    name: 'Invoice Generation',
    duration: 12,
    narration: 'Generate professional invoices in minutes. Navigate to Invoices, click Create Invoice, select a client, and add line items. The system auto-calculates totals, applies tax, and you can download a PDF or send it directly to your client.',
    action: async (page) => {
      // Navigate to invoices
      await page.click('a[href="/invoices"]');
      
      // Wait for invoices page to load - use data-testid
      await page.waitForSelector('button[data-testid="button-create-invoice"]', { timeout: 5000 });
      
      let frame = 0;
      frame = await waitWithCapture(page, 2000, frame);
      
      // Click create invoice
      const createInvoiceBtn = 'button[data-testid="button-create-invoice"]';
      if (await page.$(createInvoiceBtn)) {
        frame = await clickWithCapture(page, createInvoiceBtn, frame);
        frame = await waitWithCapture(page, 2000, frame);
        
        // Show the form
        frame = await waitWithCapture(page, 6000, frame);
        
        // Close dialog if open
        const closeBtn = 'button[aria-label="Close"]';
        if (await page.$(closeBtn)) {
          await page.click(closeBtn);
          frame = await waitWithCapture(page, 1000, frame);
        }
      } else {
        frame = await waitWithCapture(page, 8000, frame);
      }
    },
  },
  
  {
    name: 'Command Palette',
    duration: 8,
    narration: 'Power users love the Command Palette. Press Cmd+K or Ctrl+K from anywhere to instantly search tasks, projects, clients, and invoices. Execute actions without navigating menus. It\'s like Spotlight for your workflow.',
    action: async (page) => {
      let frame = 0;
      
      // Open command palette
      await page.keyboard.down('Meta'); // Cmd on Mac
      await page.keyboard.press('k');
      await page.keyboard.up('Meta');
      
      frame = await waitWithCapture(page, 1500, frame);
      
      // Type search
      frame = await typeWithCapture(page, 'input[placeholder*="Search"]', 'tasks', frame);
      frame = await waitWithCapture(page, 2000, frame);
      
      // Close
      await page.keyboard.press('Escape');
      frame = await waitWithCapture(page, 1500, frame);
    },
  },
  
  {
    name: 'Workflow Automation',
    duration: 10,
    narration: 'Workflow Automation is available on Pro and Enterprise plans. Create custom rules to automate repetitive tasks. Set conditions and actions to streamline your workflow and save hours every week.',
    action: async (page) => {
      // Navigate to workflow automation
      const workflowLink = 'a[href="/workflow-automation"]';
      if (await page.$(workflowLink)) {
        await page.click(workflowLink);
        
        // Wait for workflow automation page - wait for content to load
        await page.waitForSelector('main', { timeout: 5000 });
        // Wait for page content using network idle as proxy
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: 3000 });
        
        let frame = 0;
        frame = await waitWithCapture(page, 3000, frame);
        
        // Scroll to show rules
        await page.evaluate(() => window.scrollTo(0, 300));
        frame = await waitWithCapture(page, 3000, frame);
        
        await page.evaluate(() => window.scrollTo(0, 0));
        frame = await waitWithCapture(page, 2000, frame);
      }
    },
  },
  
  {
    name: 'Agent Management',
    duration: 12,
    narration: 'Enterprise users get access to 17 specialized AI agents that automate workflows across the development lifecycle. View agent status, graduation roadmaps, KPIs, and exposure policies. Agents operate at different autonomy levels and are governed by policy-based rules.',
    action: async (page) => {
      // Navigate to agent management
      const agentLink = 'a[href="/agent-management"]';
      if (await page.$(agentLink)) {
        await page.click(agentLink);
        
        // Wait for agent management page - wait for tabs to appear
        await page.waitForSelector('[role="tablist"]', { timeout: 5000 });
        
        let frame = 0;
        frame = await waitWithCapture(page, 3000, frame);
        
        // Click through tabs - use XPath for text-based selectors
        try {
          const visibilityTab = await page.$x('//button[contains(text(), "Visibility")]');
          if (visibilityTab.length > 0) {
            await visibilityTab[0].click();
            frame = await waitWithCapture(page, 3000, frame);
          }
        } catch (e) {
          // Tab might not exist, continue
        }
        
        try {
          const kpiTab = await page.$x('//button[contains(text(), "KPI")]');
          if (kpiTab.length > 0) {
            await kpiTab[0].click();
            frame = await waitWithCapture(page, 3000, frame);
          }
        } catch (e) {
          // Tab might not exist, continue
        }
        
        frame = await waitWithCapture(page, 2000, frame);
      }
    },
  },
  
  {
    name: 'Closing & Call to Action',
    duration: 8,
    narration: 'That\'s Gigster Garage - your comprehensive time tracker and workflow management system. Create tasks, track time, generate invoices, automate workflows, and let AI agents handle the rest. Start with our Free plan or upgrade to Pro or Enterprise for advanced features. Get started today!',
    action: async (page) => {
      // Navigate back to dashboard
      await page.click('a[href="/"]');
      
      // Wait for dashboard to load
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 5000 });
      
      let frame = 0;
      frame = await waitWithCapture(page, 6000, frame);
    },
  },
];

async function createVideoFromScreenshots() {
  console.log('Creating video from screenshots...');
  
  const inputPattern = path.join(DEMO_CONFIG.screenshotsDir, 'frame-%06d.png');
  const outputPath = DEMO_CONFIG.videoFile;
  
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPattern)
      .inputFPS(DEMO_CONFIG.fps)
      .videoCodec('libx264')
      .outputOptions([
        '-pix_fmt yuv420p',
        '-preset medium',
        '-crf 23',
      ])
      .size(`${DEMO_CONFIG.width}x${DEMO_CONFIG.height}`)
      .on('start', (cmd) => {
        console.log('FFmpeg command:', cmd);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', () => {
        console.log('Video created successfully!');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .save(outputPath);
  });
}

async function runDemo() {
  console.log('Starting Gigster Garage video demo...\n');
  
  // Create output directories
  [DEMO_CONFIG.outputDir, DEMO_CONFIG.screenshotsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--window-size=${DEMO_CONFIG.width},${DEMO_CONFIG.height}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  
  const page = await browser.newPage();
  await page.setViewport({
    width: DEMO_CONFIG.width,
    height: DEMO_CONFIG.height,
  });
  
  try {
    let totalFrames = 0;
    
    // Execute each scene
    for (const scene of scenes) {
      console.log(`\n📹 Recording scene: ${scene.name}`);
      console.log(`   Narration: ${scene.narration.substring(0, 80)}...`);
      
      try {
        await scene.action(page);
        console.log(`   ✓ Scene completed`);
      } catch (error) {
        console.error(`   ✗ Scene failed:`, error);
        // Continue with next scene
      }
    }
    
    console.log('\n✓ All scenes recorded!\n');
    
  } finally {
    await browser.close();
  }
  
  // Create video from screenshots
  const screenshotCount = fs.readdirSync(DEMO_CONFIG.screenshotsDir).length;
  
  if (screenshotCount > 0) {
    console.log(`Found ${screenshotCount} screenshots`);
    await createVideoFromScreenshots();
    
    // Generate narration script
    const scriptPath = path.join(DEMO_CONFIG.outputDir, 'narration-script.txt');
    const scriptContent = scenes.map((scene, index) => 
      `Scene ${index + 1}: ${scene.name}\nDuration: ${scene.duration}s\n${scene.narration}\n`
    ).join('\n---\n\n');
    
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`\n✓ Narration script saved to: ${scriptPath}`);
    
    console.log(`\n🎬 Video demo complete!`);
    console.log(`   Video: ${DEMO_CONFIG.videoFile}`);
    console.log(`   Duration: ~${scenes.reduce((sum, s) => sum + s.duration, 0)} seconds`);
  } else {
    console.error('No screenshots were captured!');
  }
}

// Run the demo
runDemo().catch(console.error);
