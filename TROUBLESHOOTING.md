# 🔧 Alaka Troubleshooting Guide

## **The App Won't Open**

### **Solution 1: First Time Installation**
If this is your first time opening the app:
1. **Right-click the Alaka app** in Applications
2. **Select "Open"** from the context menu
3. **Click "Open"** in the security dialog that appears

### **Solution 2: App is Running but Hidden**
The app might be running but the window is hidden:
1. **Press Cmd+Tab** to cycle through open apps
2. **Look for "Alaka"** in the app switcher
3. **Click on it** to bring it to the front

### **Solution 3: Force Quit and Restart**
If the app seems stuck:
1. **Press Cmd+Option+Esc**
2. **Select "Alaka"** from the list
3. **Click "Force Quit"**
4. **Try opening the app again**

### **Solution 4: Check Activity Monitor**
1. **Open Activity Monitor** (Applications → Utilities → Activity Monitor)
2. **Search for "Alaka"**
3. **If it's running**, double-click it to bring to front
4. **If it's not running**, try opening it again

---

## **"Ollama is not running" Error**

### **Solution: Start Ollama**
1. **Open Terminal** (Cmd+Space → "Terminal")
2. **Type this command** and press Enter:
   ```bash
   ollama serve
   ```
3. **Keep Terminal open** (minimize it)
4. **Try using Alaka again**

### **If Ollama isn't installed:**
1. **Open Terminal**
2. **Copy and paste this command**:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```
3. **Press Enter** and wait for installation
4. **Then run**: `ollama serve`

---

## **Models Won't Download**

### **Check Your Internet Connection**
- Make sure you have a stable internet connection
- Try downloading a smaller model first (e.g., `llama3.2:1b`)

### **Check Available Storage**
- Ensure you have at least 2GB free space
- Models can be 1-10GB in size

### **Try a Different Model**
- Start with `llama3.2:1b` (small and fast)
- If that works, try larger models

---

## **App Crashes or Freezes**

### **Solution 1: Restart the App**
1. **Force quit Alaka** (Cmd+Option+Esc)
2. **Wait 10 seconds**
3. **Open Alaka again**

### **Solution 2: Clear App Data**
1. **Quit Alaka**
2. **Open Finder**
3. **Press Cmd+Shift+G**
4. **Type**: `~/Library/Application Support/alaka`
5. **Delete the folder** (this will reset your settings)
6. **Open Alaka again**

### **Solution 3: Check System Resources**
- Make sure you have at least 8GB RAM available
- Close other apps to free up memory

---

## **Can't See the App Window**

### **Solution 1: Check Multiple Displays**
If you have multiple monitors:
1. **Check all your displays** for the Alaka window
2. **Move your mouse** to each screen
3. **Look for the Alaka window** on different displays

### **Solution 2: Reset Window Position**
1. **Quit Alaka**
2. **Open Terminal**
3. **Run this command**:
   ```bash
   defaults delete com.alaka.app
   ```
4. **Open Alaka again**

### **Solution 3: Use Mission Control**
1. **Press F3** (or swipe up with 3 fingers on trackpad)
2. **Look for Alaka** in the desktop overview
3. **Click on it** to bring it to the front

---

## **Still Having Issues?**

### **Check System Requirements**
- **macOS**: 10.15 (Catalina) or later
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space + model storage

### **Get Help**
If none of these solutions work:
1. **Note what you were doing** when the issue occurred
2. **Check if Ollama is running**: `ollama list` in Terminal
3. **Try restarting your computer**
4. **Contact support** with details about your system and the issue

---

**💡 Pro Tip:** The app is designed to be simple. If something isn't working, try the basic steps first - restart the app, check Ollama is running, and try a smaller model. 