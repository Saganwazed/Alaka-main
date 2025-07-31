# Alaka - AI Assistant Platform

A modern, privacy-focused AI chat application that runs locally on your Mac using Ollama. Built with Electron, React, and TypeScript.

![Alaka Screenshot](public/icon.png)

## ✨ Features

- **🔒 Privacy-First**: All AI processing happens locally on your device
- **🚀 Fast & Responsive**: Modern React interface with real-time streaming
- **🎨 Beautiful UI**: Clean, customizable interface with dark mode
- **📱 Native App**: Full desktop application with native macOS integration
- **🤖 Multiple Models**: Support for all Ollama models (Llama, Gemma, Phi, etc.)
- **💬 Chat Management**: Organize conversations with sidebar and archive
- **⚙️ Easy Setup**: Simple installation and model management

## 🚀 Quick Start

### Prerequisites

- **macOS**: 10.15 (Catalina) or later
- **Ollama**: [Install Ollama](https://ollama.ai/download) first
- **Node.js**: 18+ (for development)

### Installation

1. **Download the latest release** from the [Releases page](https://github.com/Saganwazed/Alaka-main/releases)
2. **Install Ollama** if you haven't already:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```
3. **Start Ollama**:
   ```bash
   ollama serve
   ```
4. **Download a model** (try a small one first):
   ```bash
   ollama pull phi3:mini
   ```
5. **Launch Alaka** and start chatting!

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/Saganwazed/Alaka-main.git
cd alaka

# Install dependencies
npm install

# Start development server
npm run electron:dev
```

### Build

```bash
# Build for production
npm run electron:build

# Build for distribution
npm run electron:dist
```

## 📦 Available Models

Alaka works with any Ollama model. Here are some popular options:

- **`phi3:mini`** - Fast, efficient (3.8B parameters)
- **`gemma2:2b`** - Good balance of speed/quality (2.6B parameters)
- **`llama3.2:3b`** - Llama 3 quality (3.2B parameters)
- **`neural-chat:latest`** - More capable but slower (7B parameters)

### Downloading Models

```bash
# Quick models for testing
ollama pull phi3:mini
ollama pull gemma2:2b

# More capable models
ollama pull llama3.2:3b
ollama pull neural-chat:latest
```

## 🎯 Usage

1. **Launch Alaka** from Applications
2. **Select a model** from the dropdown in the header
3. **Start chatting** - your messages are processed locally
4. **Organize chats** using the sidebar
5. **Customize** the interface in Settings

## 🔧 Troubleshooting

### Common Issues

**"Ollama is not running"**
- Make sure Ollama is installed and running: `ollama serve`

**"No models available"**
- Download a model: `ollama pull phi3:mini`

**App won't open**
- Right-click the app → "Open" (first time only)

**Slow responses**
- Try a smaller model like `phi3:mini`
- Check your Mac's available memory

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Electron for desktop app
- **AI**: Ollama for local model inference
- **Build**: Vite for fast development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) for local AI inference
- [Electron](https://electronjs.org) for cross-platform desktop apps
- [React](https://reactjs.org) for the UI framework
- [Tailwind CSS](https://tailwindcss.com) for styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Saganwazed/Alaka-main/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Saganwazed/Alaka-main/discussions)
- **Documentation**: [Wiki](https://github.com/Saganwazed/Alaka-main/wiki)

---

**Made with ❤️ for privacy-conscious AI users**
