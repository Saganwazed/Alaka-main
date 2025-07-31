import { useState } from 'react';
import { Settings, Theme, UIState, LLMModel } from '../types';

const defaultSettings: Settings = {
  model: 'phi3:mini',
  contextWindow: 4096,
  tokenLimit: 2048,
  hardwareAcceleration: 'cpu',
  systemPrompt: 'You are a helpful AI assistant running locally on the user\'s device.',
  maxTokens: 2048,
  ollamaEnabled: false,
  ollamaModel: '',
};

const defaultTheme: Theme = {
  fontFamily: '"Quicksand", sans-serif',
  llmFontFamily: '"Quicksand", sans-serif',
  fontSize: 14,
  lineSpacing: 1.5,
  padding: 16,
  accentColor: '#3b82f6',
  backgroundType: 'gradient',
  backgroundColor: '#0a0a0a',
  backgroundGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
  backgroundBlur: 0,
  backgroundOpacity: 1,
  glassmorphism: true,
};

const defaultUIState: UIState = {
  sidebarOpen: true,
  commandBarOpen: false,
  settingsOpen: false,
  customizationOpen: false,
  memoryTimelineOpen: false,
  systemPromptEditorOpen: false,
  promptEngineeringMode: false,
  developerMode: false,
  advancedMode: false,
  documentMode: false,
  voiceInputActive: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('alaka-settings');
    console.log('useSettings: Loading from localStorage:', saved);
    const parsed = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    console.log('useSettings: Final settings:', parsed);
    
    // Ensure ollamaEnabled is properly set
    if (parsed.ollamaEnabled === undefined) {
      parsed.ollamaEnabled = false;
    }
    
    // Force enable Ollama for testing
    parsed.ollamaEnabled = true;
    console.log('useSettings: Forcing ollamaEnabled to true');
    
    return parsed;
  });
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [uiState, setUIState] = useState<UIState>(defaultUIState);

  const models: LLMModel[] = [
    { id: 'llama-2-7b', name: 'Llama 2 7B', size: '7B', description: 'Fast and efficient for most tasks', isLocal: true },
    { id: 'llama-2-13b', name: 'Llama 2 13B', size: '13B', description: 'Better quality responses', isLocal: true },
    { id: 'codellama-7b', name: 'Code Llama 7B', size: '7B', description: 'Specialized for coding tasks', isLocal: true },
    { id: 'mistral-7b', name: 'Mistral 7B', size: '7B', description: 'Excellent instruction following', isLocal: true },
    { id: 'phi-2', name: 'Phi-2', size: '2.7B', description: 'Lightweight but capable', isLocal: true },
  ];

  const updateSettings = (updates: Partial<Settings>) => {
    console.log('=== UPDATE SETTINGS DEBUG ===');
    console.log('useSettings: updateSettings called with:', updates);
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      console.log('useSettings: settings updated to:', newSettings);
      localStorage.setItem('alaka-settings', JSON.stringify(newSettings));
      console.log('useSettings: localStorage updated');
      console.log('=== END UPDATE SETTINGS DEBUG ===');
      return newSettings;
    });
  };

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const updateUIState = (updates: Partial<UIState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  };

  const toggleSidebar = () => {
    updateUIState({ sidebarOpen: !uiState.sidebarOpen });
  };

  const toggleCommandBar = () => {
    updateUIState({ commandBarOpen: !uiState.commandBarOpen });
  };

  return {
    settings,
    theme,
    uiState,
    models,
    updateSettings,
    updateTheme,
    updateUIState,
    toggleSidebar,
    toggleCommandBar,
  };
};