# Alaka Installation Guide

## For Non-Technical Users

### 🎯 **Super Easy Installation**

**Step 1: Download**
- Download the DMG file for your Mac type:
  - **Intel Macs**: `Alaka-0.0.0.dmg` (112MB)
  - **Apple Silicon Macs**: `Alaka-0.0.0-arm64.dmg` (107MB)

**Step 2: Install**
1. **Double-click the DMG file** you downloaded
2. **A window will open** showing the Alaka app and Applications folder
3. **Drag Alaka to Applications** (just like installing any other Mac app)
4. **Close the DMG window** and eject the disk image

**Step 3: Install Ollama**
1. **Open Terminal** (press Cmd+Space, type "Terminal", press Enter)
2. **Copy and paste this command**:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```
3. **Press Enter** and wait for it to finish
4. **Type this command** and press Enter:
   ```bash
   ollama serve
   ```
5. **Keep Terminal open** (minimize it)

**Step 4: Start Using Alaka**
1. **Open Alaka** from Applications folder
2. **Click "Brains"** (brain icon in sidebar)
3. **Download a model** (try `llama3.2:1b`)
4. **Start chatting!**

---

## 🚀 **Quick Start (After Installation)**

1. **Launch Alaka** from Applications
2. **Click "Brains"** (brain icon)
3. **Type `llama3.2:1b`** in the model field
4. **Click "Download"** and wait
5. **Type "Hello!"** and press Enter
6. **The AI will respond!**

---

## ❓ **Common Questions**

**Q: What if the app won't open?**
A: Right-click the app → "Open" (first time only)

**Q: What if it says "Ollama not running"?**
A: Open Terminal and type: `ollama serve`

**Q: What if models won't download?**
A: Make sure you have at least 2GB free space

**Q: Which model should I try first?**
A: `llama3.2:1b` - it's small and fast

---

## 📋 **System Requirements**

- **macOS**: 10.15 (Catalina) or later
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space + model storage
- **Internet**: Required for model downloads

---

**Need help?** The app is designed to be simple - just drag, drop, and chat! 🤖 