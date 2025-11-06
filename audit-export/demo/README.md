# Gigster Garage Video Demo

This directory contains everything you need to create and view demo tutorials for Gigster Garage.

## 📁 Contents

- **`interactive-tutorial.html`** - Interactive HTML tutorial (recommended)
- **`video-demo.ts`** - Automated Puppeteer video recording script
- **`run-demo.ts`** - Video demo runner script
- **`narration-script.md`** - Complete narration for video voiceover

## 🎯 Quick Start

### Option 1: Interactive HTML Tutorial (Recommended)

The easiest way to share a demo is with the interactive HTML tutorial:

```bash
# Simply open in a browser
open demo/interactive-tutorial.html
```

**Features:**
- ✅ No dependencies or setup required
- ✅ Works offline
- ✅ Beautiful UI with navigation
- ✅ 10 chapters covering all features
- ✅ Mobile responsive
- ✅ Keyboard navigation (arrow keys)

**Perfect for:**
- User onboarding
- Sales demonstrations
- Training new team members
- Embedding in documentation

### Option 2: Automated Video Demo (Advanced)

Generate a full video demo using Puppeteer:

```bash
# 1. Make sure the server is running
npm run dev

# 2. In a new terminal, run the demo
npm run demo:video
```

**Output:**
- `attached_assets/demo/gigster-garage-demo.mp4` - Video file
- `attached_assets/demo/narration-script.txt` - Voiceover script
- `attached_assets/demo/screenshots/` - Individual frames

**Note:** Video generation is complex and may require additional setup. The interactive HTML tutorial is recommended for most use cases.

## 📖 Tutorial Chapters

Both demos cover these topics:

1. **Welcome to Gigster Garage** - Overview of features
2. **First Login & Dashboard** - Getting started
3. **Creating Your First Task** - Task management basics
4. **Time Tracking Made Easy** - One-click timers
5. **Professional Invoices** - Invoice generation
6. **Command Palette Power** - Keyboard shortcuts
7. **Workflow Automation** - Custom automation rules (Pro/Enterprise)
8. **AI Agents (Enterprise)** - 17 specialized AI agents
9. **Settings & Customization** - Personalization options
10. **You're Ready!** - Next steps and recap

## 🎬 Video Demo Details

### How It Works

The video demo uses:
- **Puppeteer** - Automated browser control
- **ffmpeg** - Video encoding from screenshots
- **Predefined scenes** - 9 scripted demonstrations

### Scenes Included

1. **Welcome & Login** (8s) - Login flow
2. **Dashboard Overview** (10s) - Main dashboard
3. **Creating a Task** (12s) - Task creation
4. **Time Tracking** (10s) - Timer functionality
5. **Invoice Generation** (12s) - Professional invoices
6. **Command Palette** (8s) - Quick actions
7. **Workflow Automation** (10s) - Automation rules
8. **Agent Management** (12s) - AI agents (admin)
9. **Closing & Call to Action** (8s) - Summary

**Total Duration:** ~90 seconds

### Customization

Edit `demo/video-demo.ts` to:
- Add new scenes
- Change timing
- Modify narration
- Adjust video quality
- Change resolution (default: 1920x1080)

## 📝 Narration Script

The complete narration script is available in `demo/narration-script.md`. Use it to:
- Record professional voiceover
- Practice live demonstrations
- Create subtitles
- Prepare sales pitches

## 🎨 Branding

Both demos use Gigster Garage's brand colors:
- **Primary:** #004C6D (Garage Navy)
- **Secondary:** #0B1D3A (Deep Navy)
- **Accent:** #60A5FA (Blue)

## 🚀 Deployment

### Hosting the Interactive Tutorial

**Option 1: Static Hosting**
```bash
# Upload to any static host
# - Vercel
# - Netlify
# - GitHub Pages
# - S3 + CloudFront
```

**Option 2: Embed in App**
```bash
# Copy to your app's public directory
cp demo/interactive-tutorial.html public/tutorial.html
```

**Option 3: Share Directly**
```bash
# Send the HTML file directly
# Users can open it locally in any browser
```

### Sharing the Video

**Option 1: Video Platforms**
- Upload to YouTube, Vimeo, or Loom
- Share the link with customers

**Option 2: Embed in Website**
```html
<video controls width="100%">
  <source src="gigster-garage-demo.mp4" type="video/mp4">
</video>
```

**Option 3: Email Attachment**
- Compress the video if needed
- Attach to onboarding emails

## 🔧 Troubleshooting

### Video Generation Issues

**Server not running:**
```bash
# Make sure the dev server is running first
npm run dev
```

**Puppeteer errors:**
```bash
# Puppeteer is already installed, but if needed:
npm install puppeteer
```

**ffmpeg errors:**
```bash
# ffmpeg-static is installed, but verify:
npm list ffmpeg-static
```

**Alternative: Use Screenshots**
If video generation fails, the screenshots are still captured in `attached_assets/demo/screenshots/`. You can:
- Manually combine them into a slideshow
- Use them for documentation
- Create a GIF instead

### Interactive Tutorial Issues

**Styling issues:**
- The tutorial is self-contained (all CSS inline)
- Works in all modern browsers
- No external dependencies

**Navigation not working:**
- Use arrow keys or click chapters in sidebar
- Previous/Next buttons at bottom

## 💡 Tips

**For Live Demos:**
1. Open the interactive tutorial beforehand
2. Practice navigation with arrow keys
3. Have the narration script ready
4. Test in the actual browser you'll use

**For Video Demos:**
1. Close unnecessary applications
2. Clear browser cache before recording
3. Use demo/test accounts for data
4. Check audio levels before recording voiceover

**For Sales:**
1. Customize the narration for your audience
2. Add company-specific examples
3. Include pricing in the "You're Ready" chapter
4. Follow up with Quick Start Guide

## 📚 Additional Resources

- **Quick Start Guide:** `docs/QUICK_START.md`
- **User Manual:** `docs/USER_MANUAL.md`
- **API Documentation:** See User Manual → API Documentation
- **NPM Package:** `@gigster-garage/api-client`

## 🎯 Use Cases

**Internal Training:**
- Onboard new team members
- Train support staff
- Document features

**Sales & Marketing:**
- Demo for prospects
- Include in pitch decks
- Embed on website

**Customer Success:**
- New customer onboarding
- Feature announcements
- Self-service support

---

**Questions?** See the User Manual or contact support.
