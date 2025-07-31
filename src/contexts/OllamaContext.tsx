import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useOllama } from '../hooks/useOllama';

interface OllamaContextType {
  isEnabled: boolean;
  isConnected: boolean;
  isLoading: boolean;
  models: any[];
  selectedModel: string;
  error: string | null;
  setEnabled: (enabled: boolean) => void;
  checkConnection: () => Promise<boolean>;
  fetchModels: () => Promise<void>;
  sendMessage: (messages: any[], modelOverride?: string) => AsyncGenerator<string, void, unknown>;
}

const OllamaContext = createContext<OllamaContextType | null>(null);

export const useOllamaContext = () => {
  const context = useContext(OllamaContext);
  if (!context) {
    throw new Error('useOllamaContext must be used within an OllamaProvider');
  }
  return context;
};

interface OllamaProviderProps {
  children: React.ReactNode;
  appSettings?: { ollamaEnabled: boolean; model?: string };
}

export const OllamaProvider: React.FC<OllamaProviderProps> = ({ children, appSettings }) => {
  // Force enable Ollama permanently
  const [isEnabled, setIsEnabled] = useState(true);
  
  console.log('OllamaProvider: Initial state:', {
    appSettingsOllamaEnabled: appSettings?.ollamaEnabled,
    isEnabled: true // Always enabled
  });
  
  const {
    isConnected,
    isLoading,
    models,
    settings,
    error,
    checkConnection: checkConnectionOriginal,
    fetchModels: fetchModelsOriginal,
    sendMessage: sendMessageOriginal,
  } = useOllama({ ollamaEnabled: true });

  // Always keep Ollama enabled
  useEffect(() => {
    console.log('OllamaContext: Forcing enabled to true');
    setIsEnabled(true);
  }, [appSettings?.ollamaEnabled]);

  // Synchronize model selection from app settings
  useEffect(() => {
    if (appSettings?.model && appSettings.model !== settings.selectedModel) {
      console.log('OllamaContext: Syncing model from app settings:', appSettings.model);
      // Update the Ollama settings to match the app settings
      const newSettings = { ...settings, selectedModel: appSettings.model };
      localStorage.setItem('ollama-settings', JSON.stringify(newSettings));
      // Force a re-render by updating the settings in the useOllama hook
      // This is a bit of a hack, but it should work
      window.dispatchEvent(new CustomEvent('ollama-settings-updated', { 
        detail: { selectedModel: appSettings.model } 
      }));
    }
  }, [appSettings?.model, settings.selectedModel]);

  const setEnabled = useCallback((enabled: boolean) => {
    console.log('OllamaContext: Setting enabled to', enabled);
    setIsEnabled(enabled);
  }, []);

  const checkConnection = useCallback(async () => {
    console.log('OllamaContext: Checking connection, enabled:', isEnabled);
    return checkConnectionOriginal();
  }, [checkConnectionOriginal, isEnabled]);

  const fetchModels = useCallback(async () => {
    console.log('OllamaContext: Fetching models, enabled:', isEnabled);
    return fetchModelsOriginal();
  }, [fetchModelsOriginal, isEnabled]);

  const sendMessage = useCallback(async function* (messages: any[], modelOverride?: string) {
    console.log('=== OLLAMA CONTEXT SEND MESSAGE ===');
    console.log('OllamaContext: Sending message, enabled:', isEnabled, 'isConnected:', isConnected, 'selectedModel:', settings.selectedModel);
    console.log('OllamaContext: Messages:', messages);
    console.log('OllamaContext: Model override:', modelOverride);
    console.log('OllamaContext: Will use model:', modelOverride || settings.selectedModel);
    console.log('=== END OLLAMA CONTEXT SEND MESSAGE ===');
    yield* sendMessageOriginal(messages, modelOverride);
  }, [sendMessageOriginal, isEnabled, isConnected, settings.selectedModel]);

  const value: OllamaContextType = {
    isEnabled,
    isConnected,
    isLoading,
    models,
    selectedModel: settings.selectedModel,
    error,
    setEnabled,
    checkConnection,
    fetchModels,
    sendMessage,
  };

  console.log('OllamaContext: Current state:', {
    isEnabled,
    isConnected,
    selectedModel: settings.selectedModel,
    modelsCount: models.length,
    models: models.map(m => m.name),
    error,
    settings: settings
  });

  return (
    <OllamaContext.Provider value={value}>
      {children}
    </OllamaContext.Provider>
  );
}; 