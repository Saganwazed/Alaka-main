# Sharing Alaka App

## Quick Share Options

### 1. **Share the DMG File (Recommended)**
The easiest way to share Alaka is to distribute the DMG file:

**Location:** `dist-electron/`
- `Alaka-0.0.0-arm64.dmg` (107MB) - For Apple Silicon Macs
- `Alaka-0.0.0.dmg` (112MB) - Universal build

**How to share:**
- Upload to Google Drive, Dropbox, or any file sharing service
- Send via email (if under size limits)
- Share via AirDrop to other Mac users
- Upload to GitHub Releases

### 2. **Installation Instructions for Recipients**

**For Mac users:**
1. Download the DMG file
2. Double-click to mount the DMG
3. Drag Alaka.app to Applications folder
4. Launch from Applications
5. **Important:** Recipients need to have Ollama installed and running

### 3. **Prerequisites for Recipients**

**Required:**
- macOS 10.15 or later
- Ollama installed and running
- At least one model downloaded in Ollama

**Install Ollama:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Download a model:**
```bash
ollama pull phi3:mini
```

### 4. **Share Source Code (For Developers)**

If sharing with developers who want to build from source:

1. **Zip the project:**
   ```bash
   zip -r alaka-app.zip . -x "node_modules/*" "dist-electron/*" ".git/*"
   ```

2. **Include build instructions:**
   ```bash
   npm install
   npm run electron:pack
   ```

### 5. **Create a GitHub Repository**

For more professional sharing:

1. Create a new GitHub repository
2. Upload the source code
3. Add the DMG files to GitHub Releases
4. Include installation and setup instructions

### 6. **Package Information**

**App Details:**
- Name: Alaka
- Version: 0.0.0
- Platform: macOS
- Architecture: ARM64 (Apple Silicon) + Universal
- Size: ~110MB

**Features:**
- Local AI chat with Ollama models
- Model switching
- Chat history
- Dark theme UI
- Electron-based desktop app

## Troubleshooting for Recipients

**Common Issues:**
1. **"Ollama not found"** - Install Ollama first
2. **"No models available"** - Download models with `ollama pull <model>`
3. **App won't open** - Check Gatekeeper settings, right-click and "Open"

**Support:**
- Check that Ollama is running: `ollama list`
- Verify models are installed: `ollama list`
- Test Ollama directly: `ollama run phi3:mini` 