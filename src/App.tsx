import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { CommandBar } from './components/CommandBar';
import { SettingsPanel } from './components/SettingsPanel';
import { CustomizationPanel } from './components/CustomizationPanel';
import { Brains } from './components/Brains';
import { Archive } from './components/Archive';
import { useChat } from './hooks/useChat';
import { OllamaProvider, useOllamaContext } from './contexts/OllamaContext';
import { useSettings } from './hooks/useSettings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ollamaService } from './services/ollama';
import { PanelLeft, Plus } from 'lucide-react';

// Electron API types
declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      getAppName: () => Promise<string>;
      onNewChat: (callback: () => void) => void;
      onOpenSettings: (callback: () => void) => void;
      onImportSession: (callback: (filePath: string) => void) => void;
      onExportSession: (callback: (filePath: string) => void) => void;
      removeAllListeners: (channel: string) => void;
      platform: string;
      isDev: boolean;
    };
  }
}

// Inner component that uses hooks that need OllamaProvider
function AppContent() {
  const {
    settings,
    theme,
    uiState,
    updateSettings,
    updateTheme,
    updateUIState,
    toggleSidebar,
    toggleCommandBar,
  } = useSettings();
  
  // Get actual models from Ollama context
  const { models } = useOllamaContext();
  
  console.log('AppContent: Available models from Ollama:', models.map((m: any) => m.name));
  console.log('AppContent: Current selected model:', settings.model);
  
  // Fetch models when component mounts and ensure we have a valid model selected
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();
        console.log('AppContent: Fetched models from Ollama API:', data);
        
        // Check if current model exists in available models
        const availableModelNames = data.models?.map((m: any) => m.name) || [];
        console.log('AppContent: Available model names:', availableModelNames);
        console.log('AppContent: Current model:', settings.model);
        
        if (availableModelNames.length > 0 && !availableModelNames.includes(settings.model)) {
          console.log('AppContent: Current model not found, switching to first available model');
          updateSettings({ model: availableModelNames[0] });
        }
      } catch (error) {
        console.error('AppContent: Error fetching models:', error);
      }
    };
    
    fetchModels();
  }, [settings.model, updateSettings]);

  const {
    sessions,
    archivedSessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    renameSession,
    archiveSession,
    unarchiveSession,
    sendMessage,
    regenerateResponse,
    deleteMessage,
  } = useChat(settings.model);

  // Brains panel state
  const [brainsOpen, setBrainsOpen] = useState(false);
  
  // Archive panel state
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Global download state
  const [downloadState, setDownloadState] = useState<{
    isDownloading: boolean;
    modelName: string;
    progress: any;
    error: string | null;
  }>({
    isDownloading: false,
    modelName: '',
    progress: null,
    error: null,
  });

  // Abort controller for cancelling downloads
  const [downloadAbortController, setDownloadAbortController] = useState<AbortController | null>(null);

  const startDownload = async (modelName: string) => {
    // Cancel any existing download
    if (downloadAbortController) {
      downloadAbortController.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    setDownloadAbortController(abortController);

    setDownloadState({
      isDownloading: true,
      modelName,
      progress: null,
      error: null,
    });

    try {
      await ollamaService.pullModel(modelName, (progress) => {
        setDownloadState(prev => ({
          ...prev,
          progress,
        }));
      }, abortController.signal);
      
      // Download completed successfully
      setDownloadState({
        isDownloading: false,
        modelName: '',
        progress: null,
        error: null,
      });
      setDownloadAbortController(null);
      
      // Automatically select the downloaded model
      console.log('Download completed, selecting model:', modelName);
      updateSettings({ model: modelName });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Download was cancelled
        setDownloadState({
          isDownloading: false,
          modelName: '',
          progress: null,
          error: 'Download cancelled',
        });
      } else {
        setDownloadState({
          isDownloading: false,
          modelName: '',
          progress: null,
          error: error instanceof Error ? error.message : 'Download failed',
        });
      }
      setDownloadAbortController(null);
    }
  };

  const cancelDownload = () => {
    if (downloadAbortController) {
      downloadAbortController.abort();
    }
  };

  // Electron integration
  useEffect(() => {
    if (window.electronAPI) {
      // Handle menu actions
      window.electronAPI.onNewChat(() => {
        createSession();
      });

      window.electronAPI.onOpenSettings(() => {
        updateUIState({ settingsOpen: true });
      });

      window.electronAPI.onImportSession((filePath: string) => {
        // TODO: Implement session import
        console.log('Import session from:', filePath);
      });

      window.electronAPI.onExportSession((filePath: string) => {
        // TODO: Implement session export
        console.log('Export session to:', filePath);
      });

      // Cleanup listeners on unmount
      return () => {
        if (window.electronAPI) {
          window.electronAPI.removeAllListeners('new-chat');
          window.electronAPI.removeAllListeners('open-settings');
          window.electronAPI.removeAllListeners('import-session');
          window.electronAPI.removeAllListeners('export-session');
        }
      };
    }
  }, [createSession, updateUIState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandBar();
      }
      // New chat
      else if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        createSession();
      }
      // Settings
      else if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        updateUIState({ settingsOpen: true });
      }
      // Customization
      else if (e.key === 't' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        updateUIState({ customizationOpen: true });
      }
      // Toggle sidebar
      else if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
      // Prompt engineering mode
      else if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        updateUIState({ promptEngineeringMode: !uiState.promptEngineeringMode });
      }
      // Developer mode
      else if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        updateUIState({ developerMode: !uiState.developerMode });
      }
      // Close modals with Escape
      else if (e.key === 'Escape') {
        updateUIState({
          commandBarOpen: false,
          settingsOpen: false,
          customizationOpen: false,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleCommandBar,
    createSession,
    updateUIState,
    toggleSidebar,
    uiState.promptEngineeringMode,
    uiState.developerMode,
  ]);

  // Apply theme styles
  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', theme.fontFamily);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  }, [theme]);

  const backgroundStyle = theme.backgroundType === 'gradient'
    ? { background: theme.backgroundGradient }
    : theme.backgroundType === 'image' && theme.backgroundImage
    ? { 
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: theme.backgroundColor };

  console.log('App component is rendering!');

  return (
    <div 
      className="min-h-screen h-screen flex text-white overflow-hidden bg-black"
      style={backgroundStyle}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={uiState.sidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onToggle={toggleSidebar}
        onSessionSelect={setActiveSessionId}
        onCreateSession={createSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onOpenSettings={() => updateUIState({ settingsOpen: true })}
        onOpenCustomization={() => updateUIState({ customizationOpen: true })}
        onOpenBrains={() => setBrainsOpen(true)}
        onOpenArchive={() => setArchiveOpen(true)}
        onArchiveSession={archiveSession}
        theme={theme}
      />

      {/* Main Chat Interface */}
      <ChatInterface
        activeSession={activeSession}
        onSendMessage={sendMessage}
        onRegenerateResponse={(messageId) => regenerateResponse(messageId)}
        onDeleteMessage={deleteMessage}
        onOpenCommandBar={toggleCommandBar}
        theme={theme}
        sidebarOpen={uiState.sidebarOpen}
        documentMode={uiState.documentMode}
        voiceInputActive={uiState.voiceInputActive}
        onToggleDocumentMode={() => updateUIState({ documentMode: !uiState.documentMode })}
        onToggleVoiceInput={() => updateUIState({ voiceInputActive: !uiState.voiceInputActive })}
        currentModel={settings.model}
        availableModels={models.map((m: any) => m.name)}
        onModelSelect={(modelName) => {
          console.log('=== MODEL SELECTION DEBUG ===');
          console.log('Model selected in header:', modelName);
          console.log('Previous model:', settings.model);
          updateSettings({ model: modelName });
          console.log('Settings updated, new model should be:', modelName);
          console.log('=== END MODEL SELECTION DEBUG ===');
        }}
        onToggleSidebar={toggleSidebar}
        onCreateSession={createSession}
      />

      {/* Command Bar */}
      <CommandBar
        isOpen={uiState.commandBarOpen}
        onClose={() => updateUIState({ commandBarOpen: false })}
        onCreateSession={createSession}
        onOpenSettings={() => {
          updateUIState({ settingsOpen: true, commandBarOpen: false });
        }}
        onOpenCustomization={() => {
          updateUIState({ customizationOpen: true, commandBarOpen: false });
        }}
        onTogglePromptEngineering={() => {
          updateUIState({ promptEngineeringMode: !uiState.promptEngineeringMode });
        }}
        onToggleDeveloperMode={() => {
          updateUIState({ developerMode: !uiState.developerMode });
        }}
        theme={theme}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={uiState.settingsOpen}
        settings={settings}
        models={models}
        onClose={() => updateUIState({ settingsOpen: false })}
        onUpdateSettings={updateSettings}
        theme={theme}
        downloadState={downloadState}
        onStartDownload={startDownload}
        onCancelDownload={cancelDownload}
      />

      {/* Brains Panel */}
      <Brains
        isOpen={brainsOpen}
        settings={settings}
        models={models}
        onClose={() => setBrainsOpen(false)}
        onUpdateSettings={updateSettings}
        theme={theme}
        downloadState={downloadState}
        onStartDownload={startDownload}
        onCancelDownload={cancelDownload}
      />

      {/* Archive Panel */}
      <Archive
        isOpen={archiveOpen}
        archivedSessions={archivedSessions}
        onClose={() => setArchiveOpen(false)}
        onUnarchive={unarchiveSession}
        onDelete={deleteSession}
        theme={theme}
      />

      {/* Customization Panel */}
      <CustomizationPanel
        isOpen={uiState.customizationOpen}
        theme={theme}
        onClose={() => updateUIState({ customizationOpen: false })}
        onUpdateTheme={updateTheme}
      />

      {/* Developer Mode Indicator */}
      {uiState.developerMode && (
        <div className="fixed bottom-4 right-4 px-3 py-1 bg-green-600 text-white text-xs rounded-full">
          Developer Mode
        </div>
      )}

      {/* Prompt Engineering Mode Indicator */}
      {uiState.promptEngineeringMode && (
        <div className="fixed bottom-4 right-20 px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
          Prompt Engineering
        </div>
      )}
      

      
      {/* Ensure no white background bleeds through */}
      <div className="fixed inset-0 bg-black -z-10"></div>
    </div>
  );
}

function App() {
  const {
    settings,
    theme,
    uiState,
    models,
    updateSettings,
    updateTheme,
    updateUIState,
    toggleSidebar,
    toggleCommandBar,
  } = useSettings();

  console.log('App component is rendering!');
  console.log('App settings:', settings);
  console.log('Ollama enabled:', settings.ollamaEnabled);
  console.log('Settings object:', JSON.stringify(settings, null, 2));

  return (
    <ErrorBoundary>
      <OllamaProvider appSettings={{ ollamaEnabled: settings.ollamaEnabled, model: settings.model }}>
        <AppContent />
      </OllamaProvider>
    </ErrorBoundary>
  );
}

export default App;