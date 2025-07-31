import React, { useState } from 'react';
import { 
  Server, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Thermometer,
  Sliders,
  Hash,
  Type
} from 'lucide-react';
import { useOllama } from '../hooks/useOllama';

interface OllamaSettingsProps {
  theme: any;
  downloadState?: {
    isDownloading: boolean;
    modelName: string;
    progress: any;
    error: string | null;
  };
  onStartDownload?: (modelName: string) => Promise<void>;
  onCancelDownload?: () => void;
  ollamaEnabled?: boolean;
  onToggleOllama?: (enabled: boolean) => void;
  selectedModel?: string;
  onModelSelect?: (modelName: string) => void;
}

export const OllamaSettings: React.FC<OllamaSettingsProps> = ({ 
  theme, 
  downloadState, 
  onStartDownload,
  onCancelDownload,
  ollamaEnabled = false,
  onToggleOllama,
  selectedModel,
  onModelSelect
}) => {
  const {
    isConnected,
    isLoading,
    models,
    settings,
    error,
    checkConnection,
    fetchModels,
    updateSettings,
  } = useOllama({ ollamaEnabled });

  const [pullModelName, setPullModelName] = useState('');

  const handlePullModel = async () => {
    if (!pullModelName.trim() || !onStartDownload) return;
    
    try {
      await onStartDownload(pullModelName.trim());
      setPullModelName('');
      // Note: The model will be automatically selected when download completes
      // through the download completion callback in the parent component
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const popularModels = [
    'llama3.2:3b',
    'llama3.2:1b',
    'mistral:7b',
    'phi3:mini',
    'gemma2:2b',
    'qwen2.5:3b',
    'codellama:7b',
  ];

  return (
    <div className="space-y-6">
      {/* Ollama Connection */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Server size={20} />
          Ollama Connection
        </h3>
        
        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ollamaEnabled}
              onChange={(e) => {
                console.log('Toggle clicked:', e.target.checked);
                const enabled = e.target.checked;
                updateSettings({ enabled: enabled });
                onToggleOllama?.(enabled);
                
                // Force a connection check when enabled
                if (enabled) {
                  setTimeout(() => {
                    console.log('Forcing connection check after enable');
                    checkConnection();
                  }, 100);
                }
              }}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20"
            />
            <div>
              <span className="text-white font-medium">Enable Ollama Backend</span>
              <p className="text-xs text-gray-400">Use local Ollama models for chat</p>
            </div>
          </label>

          {ollamaEnabled && (
            <>
              {/* Connection Status */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                {isConnected ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : (
                  <AlertCircle size={20} className="text-red-400" />
                )}
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {isConnected ? 'Connected to Ollama' : 'Not Connected'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isConnected ? `localhost:11434 (${models.length} models available)` : 'Please start Ollama service'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={checkConnection}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-300 hover:text-blue-200 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5"
                    title="Retry connection to Ollama"
                  >
                    <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Connecting...' : 'Retry'}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle size={16} />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Debug Information */}
              {ollamaEnabled && (
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-2">Debug Information:</div>
                  <div className="text-xs space-y-1">
                    <div>Connection Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                    <div>Loading State: {isLoading ? '🔄 Loading' : '⏸️ Idle'}</div>
                    <div>Models Count: {models.length}</div>
                    <div>Selected Model: {settings.selectedModel || 'None'}</div>
                    <div>Enabled: {ollamaEnabled ? '✅ Yes' : '❌ No'}</div>
                    {models.length > 0 && (
                      <div>Available Models: {models.map(m => m.name).join(', ')}</div>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        console.log('Manual connection test');
                        checkConnection();
                      }}
                      className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs rounded"
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={() => {
                        console.log('Manual model fetch');
                        fetchModels();
                      }}
                      className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 text-xs rounded"
                    >
                      Fetch Models
                    </button>
                    {models.length > 0 && !settings.selectedModel && (
                      <button
                        onClick={() => {
                          const model = models.find(m => m.name.includes('neural-chat')) || models[0];
                          console.log('Manual model selection:', model.name);
                          updateSettings({ selectedModel: model.name });
                        }}
                        className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 text-xs rounded"
                      >
                        Select Model
                      </button>
                    )}
                    {settings.selectedModel && (
                      <button
                        onClick={async () => {
                          console.log('Testing chat with model:', settings.selectedModel);
                          try {
                            const response = await fetch('http://localhost:11434/api/chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                model: settings.selectedModel,
                                messages: [{ role: 'user', content: 'Hello' }],
                                stream: false
                              })
                            });
                            const data = await response.json();
                            console.log('Test chat response:', data);
                            alert(`Test successful! Response: ${data.message?.content || 'No content'}`);
                          } catch (error) {
                            console.error('Test chat failed:', error);
                            alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          }
                        }}
                        className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs rounded"
                      >
                        Test Chat
                      </button>
                    )}
                    <button
                      onClick={() => {
                        console.log('Testing context values...');
                        console.log('Current context:', {
                          isEnabled: ollamaEnabled,
                          isConnected,
                          selectedModel: settings.selectedModel,
                          models: models.map(m => m.name)
                        });
                        alert(`Context Test:\nEnabled: ${ollamaEnabled}\nConnected: ${isConnected}\nSelected Model: ${settings.selectedModel}\nModels: ${models.map(m => m.name).join(', ')}`);
                      }}
                      className="px-2 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-xs rounded"
                    >
                      Test Context
                    </button>
                  </div>
                </div>
              )}

              {/* Model Selection */}
              {ollamaEnabled && isConnected && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Model Selection</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Selected Model
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedModel || settings.selectedModel}
                          onChange={(e) => {
                            console.log('Model selection changed:', e.target.value);
                            console.log('Available models:', models.map(m => m.name));
                            updateSettings({ selectedModel: e.target.value });
                            onModelSelect?.(e.target.value);
                          }}
                          className="flex-1 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">Select a model</option>
                          {models.map((model) => (
                            <option key={model.name} value={model.name}>
                              {model.name} ({Math.round(model.size / 1024 / 1024 / 1024 * 10) / 10}GB)
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={fetchModels}
                          disabled={isLoading}
                          className="p-3 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200"
                          title="Refresh models list"
                        >
                          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                      </div>
                      
                      {/* Quick Download Section */}
                      <div className="mt-4 p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                        <div className="text-sm text-white font-medium mb-3">Quick Download Models</div>
                        <div className="grid grid-cols-2 gap-2">
                          {popularModels.map((modelName) => {
                            const isInstalled = models.some(m => m.name === modelName);
                            const isDownloading = downloadState?.isDownloading && downloadState.modelName === modelName;
                            
                            return (
                              <button
                                key={modelName}
                                onClick={() => {
                                  if (isInstalled) {
                                    // Select the model if it's already installed
                                    updateSettings({ selectedModel: modelName });
                                    onModelSelect?.(modelName);
                                  } else if (onStartDownload) {
                                    // Download the model
                                    onStartDownload(modelName);
                                  }
                                }}
                                disabled={isDownloading}
                                className={`flex items-center justify-between p-2 rounded text-xs transition-colors ${
                                  isInstalled
                                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                    : isDownloading
                                    ? 'bg-blue-600/20 text-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                                }`}
                              >
                                <span className="truncate">{modelName}</span>
                                {isInstalled ? (
                                  <CheckCircle size={12} />
                                ) : isDownloading ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Download size={12} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Custom Model Download */}
                        <div className="mt-3 pt-3 border-t border-gray-600/30">
                          <div className="text-xs text-gray-400 mb-2">Download Custom Model</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={pullModelName}
                              onChange={(e) => setPullModelName(e.target.value)}
                              placeholder="e.g., llama3.2:3b"
                              className="flex-1 p-2 bg-gray-700/50 border border-gray-600 rounded text-white text-xs placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                            />
                            <button
                              onClick={handlePullModel}
                              disabled={!pullModelName.trim() || (downloadState?.isDownloading && downloadState.modelName === pullModelName)}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
                            >
                              {downloadState?.isDownloading && downloadState.modelName === pullModelName ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Download size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Download Progress */}
                      {downloadState?.isDownloading && (
                        <div className="mt-3 p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                          <div className="flex items-center justify-between text-xs text-blue-400 mb-2">
                            <span>Downloading {downloadState.modelName}...</span>
                            <button
                              onClick={onCancelDownload}
                              className="text-red-400 hover:text-red-300"
                            >
                              Cancel
                            </button>
                          </div>
                          {downloadState.progress && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${downloadState.progress.percentage || 0}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-400">
                        Available models: {models.length > 0 ? models.map(m => m.name).join(', ') : 'None'}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Selected model: {settings.selectedModel || 'None'}
                      </div>
                      {settings.selectedModel && !models.find(m => m.name === settings.selectedModel) && (
                        <div className="mt-1 text-xs text-yellow-400">
                          ⚠️ Selected model not found in available models. Please refresh the list.
                        </div>
                      )}
                      {models.length === 0 && (
                        <div className="mt-1 text-xs text-orange-400">
                          ℹ️ No models found. Use "ollama pull modelname" to download a model.
                        </div>
                      )}
                      
                      {/* Popular Models Suggestion */}
                      {models.length === 0 && (
                        <div className="mt-4 p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                          <div className="text-sm text-white font-medium mb-2">Popular Models to Download:</div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>• <code className="bg-gray-700 px-1 rounded">ollama pull phi3:mini</code> - Fast, lightweight (1.3GB)</div>
                            <div>• <code className="bg-gray-700 px-1 rounded">ollama pull neural-chat:latest</code> - Good balance (4.1GB)</div>
                            <div>• <code className="bg-gray-700 px-1 rounded">ollama pull llama3.2:3b</code> - Meta's latest (2GB)</div>
                            <div>• <code className="bg-gray-700 px-1 rounded">ollama pull mistral:7b</code> - High quality (4.1GB)</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Model Parameters */}
              {ollamaEnabled && isConnected && settings.selectedModel && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Sliders size={20} />
                    Model Parameters
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Thermometer size={16} />
                        Temperature: {settings.temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Conservative (0)</span>
                        <span>Balanced (1)</span>
                        <span>Creative (2)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Top P: {settings.topP}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.topP}
                        onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Focused (0)</span>
                        <span>Diverse (1)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Hash size={16} />
                        Top K: {settings.topK}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={settings.topK}
                        onChange={(e) => updateSettings({ topK: parseInt(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Conservative (1)</span>
                        <span>Balanced (40)</span>
                        <span>Diverse (100)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Type size={16} />
                        Max Tokens: {settings.maxTokens}
                      </label>
                      <input
                        type="range"
                        min="256"
                        max="4096"
                        step="256"
                        value={settings.maxTokens}
                        onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Short (256)</span>
                        <span>Medium (2048)</span>
                        <span>Long (4096)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};