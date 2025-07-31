import React, { useState } from 'react';
import { X, Cpu, Zap, Server, Monitor, Download, RefreshCw, Thermometer, Hash, Type, Settings, Brain } from 'lucide-react';
import { Settings as SettingsType, LLMModel } from '../types';
import { OllamaSettings } from './OllamaSettings';

interface BrainsProps {
  isOpen: boolean;
  settings: SettingsType;
  models: LLMModel[];
  onClose: () => void;
  onUpdateSettings: (updates: Partial<SettingsType>) => void;
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

export const Brains: React.FC<BrainsProps> = ({
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
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg"
        style={panelStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Brain size={20} />
            Brains
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Welcome Message */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-400 mb-2 flex items-center gap-2">
              <Brain size={20} />
              Welcome to Alaka!
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Alaka works in <strong>demo mode</strong> by default. You can explore the interface and see how it works without installing anything.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              To use the full AI capabilities with local models, install Ollama and enable it below.
            </p>
          </div>



          {/* Context Window */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Context Window</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="1024"
                max="8192"
                step="1024"
                value={settings.contextWindow}
                onChange={(e) => onUpdateSettings({ contextWindow: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>1K tokens</span>
                <span>{settings.contextWindow} tokens</span>
                <span>8K tokens</span>
              </div>
            </div>
          </div>

          {/* Response Length */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Response Length</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="512"
                max="4096"
                step="512"
                value={settings.maxTokens}
                onChange={(e) => onUpdateSettings({ maxTokens: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Short</span>
                <span>{settings.maxTokens} tokens</span>
                <span>Long</span>
              </div>
            </div>
          </div>

          {/* Hardware Acceleration */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Zap size={20} />
              Hardware Acceleration
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="hardware"
                  value="gpu"
                  checked={settings.hardwareAcceleration === 'gpu'}
                  onChange={(e) => onUpdateSettings({ hardwareAcceleration: e.target.value as 'gpu' | 'cpu' })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className="text-white">GPU Acceleration</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="hardware"
                  value="cpu"
                  checked={settings.hardwareAcceleration === 'cpu'}
                  onChange={(e) => onUpdateSettings({ hardwareAcceleration: e.target.value as 'gpu' | 'cpu' })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className="text-white">CPU Only</span>
              </label>
            </div>
          </div>

          {/* Ollama Integration */}
          <OllamaSettings 
            theme={theme} 
            downloadState={downloadState}
            onStartDownload={onStartDownload}
            onCancelDownload={onCancelDownload}
            ollamaEnabled={settings.ollamaEnabled}
            selectedModel={settings.model}
            onModelSelect={(modelName) => {
              console.log('Model selected in Brains:', modelName);
              onUpdateSettings({ model: modelName });
            }}
            onToggleOllama={(enabled) => {
              console.log('Toggle clicked:', enabled);
              onUpdateSettings({ ollamaEnabled: enabled });
            }}
          />



          {/* System Prompt */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">System Prompt</h3>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => onUpdateSettings({ systemPrompt: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              rows={4}
              placeholder="Enter system prompt..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 