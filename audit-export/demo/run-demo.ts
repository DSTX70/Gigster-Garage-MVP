#!/usr/bin/env tsx
/**
 * Gigster Garage Video Demo Runner
 * 
 * This script creates an automated video demo of Gigster Garage
 * using Puppeteer for screen recording.
 * 
 * Usage:
 *   npm run demo:video
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  console.log('🎬 Gigster Garage Video Demo');
  console.log('================================\n');

  // Check if server is running
  console.log('Checking if server is running...');
  try {
    const response = await fetch('http://localhost:5000');
    if (!response.ok) {
      throw new Error('Server not responding');
    }
    console.log('✓ Server is running\n');
  } catch (error) {
    console.error('✗ Server is not running!');
    console.error('Please start the server first with: npm run dev\n');
    process.exit(1);
  }

  // Run the video demo script
  console.log('Starting video recording...\n');
  try {
    await execAsync('npx tsx demo/video-demo.ts');
    console.log('\n✓ Video demo complete!');
    console.log('\nOutput files:');
    console.log('  - Video: attached_assets/demo/gigster-garage-demo.mp4');
    console.log('  - Script: attached_assets/demo/narration-script.txt');
    console.log('  - Screenshots: attached_assets/demo/screenshots/\n');
  } catch (error) {
    console.error('\n✗ Video recording failed:',error);
    console.error('\nNote: Video generation is complex and may fail in some environments.');
    console.error('Use the interactive HTML tutorial instead: demo/interactive-tutorial.html\n');
    process.exit(1);
  }
}

main();
