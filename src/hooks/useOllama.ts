import { useState, useEffect, useCallback } from 'react';
import { ollamaService, OllamaModel, OllamaMessage, ModelDownloadProgress } from '../services/ollama';

export interface OllamaSettings {
  enabled: boolean;
  selectedModel: string;
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
}

const defaultSettings: OllamaSettings = {
  enabled: false, // Start with Ollama disabled
  selectedModel: '',
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 2048,
};

export const useOllama = (appSettings?: { ollamaEnabled: boolean }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [settings, setSettings] = useState<OllamaSettings>(() => {
    const saved = localStorage.getItem('ollama-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [error, setError] = useState<string | null>(null);

  // Force enable Ollama permanently
  console.log('useOllama: Forcing enabled to true');
  
  // Always use Ollama - no demo mode
  const forcedEnabled = true;

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ollama-settings', JSON.stringify(settings));
  }, [settings]);

  // Listen for localStorage changes to reload settings
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ollama-settings');
      if (saved) {
        const newSettings = JSON.parse(saved);
        console.log('useOllama: Reloading settings from localStorage:', newSettings);
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update local settings when app settings change
  useEffect(() => {
    if (appSettings?.ollamaEnabled !== undefined) {
      console.log('useOllama: Updating local settings from app settings:', appSettings.ollamaEnabled);
      setSettings(prev => ({ ...prev, enabled: appSettings.ollamaEnabled }));
    }
  }, [appSettings?.ollamaEnabled]);

  // Listen for model updates from app settings
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('useOllama: Received settings update event:', event.detail);
      if (event.detail.selectedModel) {
        setSettings(prev => ({ ...prev, selectedModel: event.detail.selectedModel }));
      }
    };

    const handleModelChanged = (event: CustomEvent) => {
      console.log('=== USE OLLAMA MODEL CHANGED EVENT ===');
      console.log('useOllama: Received model changed event:', event.detail);
      if (event.detail.selectedModel) {
        console.log('useOllama: Updating settings from', settings.selectedModel, 'to', event.detail.selectedModel);
        setSettings(prev => ({ ...prev, selectedModel: event.detail.selectedModel }));
        console.log('useOllama: Settings updated');
      }
      console.log('=== END USE OLLAMA MODEL CHANGED EVENT ===');
    };

    window.addEventListener('ollama-settings-updated', handleSettingsUpdate as EventListener);
    window.addEventListener('ollama-model-changed', handleModelChanged as EventListener);
    
    return () => {
      window.removeEventListener('ollama-settings-updated', handleSettingsUpdate as EventListener);
      window.removeEventListener('ollama-model-changed', handleModelChanged as EventListener);
    };
  }, []);

  const checkConnection = useCallback(async () => {
    console.log('checkConnection called, isEnabled:', forcedEnabled);
    if (!forcedEnabled) {
      console.log('Ollama is disabled, not checking connection');
      setIsConnected(false);
      setError(null);
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to connect to Ollama...');
      const connected = await ollamaService.checkConnection();
      console.log('Connection result:', connected);
      setIsConnected(connected);
      
      if (!connected) {
        setError('Ollama is not running. Please launch it from your system.');
      } else {
        // If connected, try to fetch models to ensure everything is working
        try {
          const models = await ollamaService.getModels();
          console.log('Successfully fetched models:', models);
          if (models.length === 0) {
            setError('Ollama is connected but no models are available. Please download a model first.');
          } else {
            // Clear any previous errors if we have models
            setError(null);
          }
        } catch (modelError) {
          console.error('Error fetching models after connection:', modelError);
          setError('Ollama is connected but unable to fetch models. Please check if Ollama is running properly.');
        }
      }
      
      return connected;
    } catch (err) {
      console.error('Connection error:', err);
      setIsConnected(false);
      setError('Failed to connect to Ollama. Please ensure it\'s running on localhost:11434');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [forcedEnabled]);

  const fetchModels = useCallback(async () => {
    if (!forcedEnabled) {
      setModels([]);
      return;
    }
    
    if (!isConnected) {
      console.log('Not connected, skipping model fetch');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching models from Ollama...');
      const fetchedModels = await ollamaService.getModels();
      console.log('Fetched models:', fetchedModels);
      setModels(fetchedModels);
      
      // Auto-select first model if none selected
      if (fetchedModels.length > 0 && !settings.selectedModel) {
        console.log('Auto-selecting first model:', fetchedModels[0].name);
        setSettings(prev => ({ ...prev, selectedModel: fetchedModels[0].name }));
      }
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Failed to fetch models from Ollama. Please check if Ollama is running properly.');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, forcedEnabled, settings.selectedModel]);

  const pullModel = useCallback(async (modelName: string, onProgress?: (progress: ModelDownloadProgress) => void) => {
    if (!isConnected || !forcedEnabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await ollamaService.pullModel(modelName, onProgress);
      // Refresh models list after successful pull
      await fetchModels();
    } catch (err) {
      setError(`Failed to pull model: ${modelName}`);
      console.error('Error pulling model:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, forcedEnabled, fetchModels]);

  const deleteModel = useCallback(async (modelName: string) => {
    if (!isConnected || !forcedEnabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await ollamaService.deleteModel(modelName);
      // Refresh models list after successful deletion
      await fetchModels();
      
      // If the deleted model was selected, clear the selection
      if (settings.selectedModel === modelName) {
        setSettings(prev => ({ ...prev, selectedModel: '' }));
      }
    } catch (err) {
      setError(`Failed to delete model: ${modelName}`);
      console.error('Error deleting model:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, forcedEnabled, fetchModels, settings.selectedModel]);

  const sendMessage = useCallback(async function* (
    messages: OllamaMessage[],
    modelOverride?: string
  ): AsyncGenerator<string, void, unknown> {
    console.log('sendMessage called with:', { 
      isEnabled: forcedEnabled, 
      isConnected, 
      selectedModel: settings.selectedModel, 
      modelOverride,
      appSettings,
      messagesCount: messages.length 
    });
    
    // Always use Ollama - no demo mode
    if (!forcedEnabled) {
      throw new Error('Ollama is not enabled. Please enable Ollama in settings.');
    }

    if (!isConnected) {
      console.error('Ollama is not connected');
      throw new Error('Ollama is not connected. Please check your connection and try again.');
    }

    const model = modelOverride || settings.selectedModel;
    console.log('Using model:', model);
    console.log('Model details:', {
      modelOverride,
      selectedModel: settings.selectedModel,
      finalModel: model
    });
    
    if (!model) {
      console.error('No model selected');
      throw new Error('No model selected. Please select a model in the settings.');
    }

    try {
      console.log('Starting chat stream with model:', model);
      const stream = ollamaService.streamChat({
        model,
        messages,
        options: {
          temperature: settings.temperature,
          top_p: settings.topP,
          top_k: settings.topK,
          num_predict: settings.maxTokens,
        },
      });

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (err) {
      console.error('Error in sendMessage:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to send message to Ollama: ${errorMessage}`);
      throw err;
    }
  }, [isConnected, settings, forcedEnabled]);

  const updateSettings = useCallback((updates: Partial<OllamaSettings>) => {
    console.log('useOllama: updateSettings called with:', updates);
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      console.log('useOllama: settings updated to:', newSettings);
      return newSettings;
    });
  }, []);

  // Initialize connection check
  useEffect(() => {
    if (forcedEnabled) {
      console.log('useOllama: Initializing connection check');
      checkConnection();
    } else {
      setIsConnected(false);
      setError(null);
    }
  }, [checkConnection, forcedEnabled]);

  // Force connection check when component mounts
  useEffect(() => {
    if (forcedEnabled) {
      console.log('useOllama: Force checking connection on mount');
      const initConnection = async () => {
        try {
          const connected = await ollamaService.checkConnection();
          console.log('useOllama: Initial connection check result:', connected);
          setIsConnected(connected);
          if (connected) {
            // If connected, fetch models
            const models = await ollamaService.getModels();
            setModels(models);
            console.log('useOllama: Initial models fetch:', models);
          }
        } catch (error) {
          console.error('useOllama: Initial connection check failed:', error);
          setIsConnected(false);
        }
      };
      initConnection();
    }
  }, [forcedEnabled]);

  // Fetch models when connected
  useEffect(() => {
    if (forcedEnabled && isConnected) {
      console.log('Connection established, fetching models...');
      fetchModels();
    }
  }, [isConnected, fetchModels, forcedEnabled]);

  // Auto-select model when models are loaded and none is selected
  useEffect(() => {
    console.log('Auto-selection check:', {
      modelsLength: models.length,
      selectedModel: settings.selectedModel,
      isEnabled: forcedEnabled,
      isConnected,
      models: models.map(m => m.name)
    });
    
    if (models.length > 0 && forcedEnabled && isConnected) {
      // If no model is selected, or if the selected model is not available, select a new one
      const isSelectedModelAvailable = settings.selectedModel && models.find(m => m.name === settings.selectedModel);
      
      if (!isSelectedModelAvailable) {
        // Try to find a preferred model, then fall back to first available
        const preferredModels = ['phi3:mini', 'neural-chat:latest', 'llama3.2:3b', 'mistral:7b'];
        let modelToSelect = null;
        
        // First try to find a preferred model
        for (const preferredModel of preferredModels) {
          const found = models.find(m => m.name.includes(preferredModel.split(':')[0]));
          if (found) {
            modelToSelect = found;
            break;
          }
        }
        
        // If no preferred model found, use the first available
        if (!modelToSelect) {
          modelToSelect = models[0];
        }
        
        console.log('Auto-selecting model:', modelToSelect.name);
        setSettings(prev => ({ ...prev, selectedModel: modelToSelect.name }));
      }
    }
  }, [models, settings.selectedModel, forcedEnabled, isConnected]);

  return {
    isConnected,
    isLoading,
    models,
    settings,
    error,
    checkConnection,
    fetchModels,
    pullModel,
    deleteModel,
    sendMessage,
    updateSettings,
  };
};