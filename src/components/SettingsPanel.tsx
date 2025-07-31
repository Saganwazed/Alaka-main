import React, { useState } from 'react';
import { X, Cpu, Zap, Server, Monitor, Download } from 'lucide-react';
import { Settings, LLMModel } from '../types';
import { OllamaSettings } from './OllamaSettings';
import { ModelManager } from './ModelManager';
import { ErrorBoundary } from './ErrorBoundary';

interface SettingsPanelProps {
  isOpen: boolean;
  settings: Settings;
  models: LLMModel[];
  onClose: () => void;
  onUpdateSettings: (updates: Partial<Settings>) => void;
  theme: any;
  downloadState?: {
    isDownloading: boolean;
    modelName: string;
    progress: any;
    error: string | null;
  };
  onStartDownload?: (modelName: string) => Promise<void>;
  onCancelDownload?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  settings,
  models,
  onClose,
  onUpdateSettings,
  theme,
  downloadState,
  onStartDownload,
  onCancelDownload,
}) => {
  const [modelManagerOpen, setModelManagerOpen] = useState(false);
  
  if (!isOpen) return null;

  const panelStyle = theme.glassmorphism
    ? {
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }
    : {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg"
        style={panelStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium">Application Theme</label>
                <p className="text-gray-400 text-sm">Customize the appearance of Alaka</p>
              </div>
              <div>
                <label className="text-white text-sm font-medium">Chat Interface</label>
                <p className="text-gray-400 text-sm">Configure chat display and behavior</p>
              </div>
              <div>
                <label className="text-white text-sm font-medium">Export Options</label>
                <p className="text-gray-400 text-sm">Manage session export settings</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">About</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Alaka (Beta 0) - Local AI Chat Interface</p>
              <p>Built with React, TypeScript, and Electron</p>
              <p>Powered by Ollama for local model inference</p>
            </div>
          </div>
        </div>
      </div>
      
          {/* Model Manager */}
      <ModelManager
        isOpen={modelManagerOpen}
        onClose={() => setModelManagerOpen(false)}
        onModelSelect={(modelName) => {
          onUpdateSettings({ model: modelName });
          setModelManagerOpen(false);
        }}
        selectedModel={settings.model}
      />
    </div>
  );
};