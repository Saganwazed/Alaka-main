import React, { useState, useEffect } from 'react';
import { Download, MoreVertical, Info, Play, RefreshCw, AlertCircle, CheckCircle, X, Trash2 } from 'lucide-react';
import { ollamaService, OllamaModel, ModelDownloadProgress } from '../services/ollama';

interface ModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onModelSelect: (modelName: string) => void;
  selectedModel?: string;
}

interface PopularModel {
  name: string;
  description: string;
  size: string;
  tags: string[];
}

const POPULAR_MODELS: PopularModel[] = [
  {
    name: 'llama2',
    description: 'Meta\'s Llama 2 - 7B parameter model, good for general tasks',
    size: '3.8GB',
    tags: ['general', 'chat', '7B']
  },
  {
    name: 'llama2:13b',
    description: 'Meta\'s Llama 2 - 13B parameter model, better performance',
    size: '7.3GB',
    tags: ['general', 'chat', '13B']
  },
  {
    name: 'llama2:70b',
    description: 'Meta\'s Llama 2 - 70B parameter model, best performance',
    size: '39GB',
    tags: ['general', 'chat', '70B']
  },
  {
    name: 'mistral',
    description: 'Mistral AI\'s 7B model, excellent performance',
    size: '4.1GB',
    tags: ['general', 'chat', '7B']
  },
  {
    name: 'codellama',
    description: 'Code-focused Llama model, great for programming',
    size: '3.8GB',
    tags: ['code', 'programming', '7B']
  },
  {
    name: 'phi2',
    description: 'Microsoft\'s Phi-2, small but capable model',
    size: '1.7GB',
    tags: ['general', 'chat', '2.7B']
  },
  {
    name: 'neural-chat',
    description: 'Intel\'s Neural Chat model, optimized for conversations',
    size: '3.8GB',
    tags: ['chat', 'conversation', '7B']
  },
  {
    name: 'orca-mini',
    description: 'Lightweight model, good for basic tasks',
    size: '1.9GB',
    tags: ['lightweight', 'basic', '3B']
  }
];

export const ModelManager: React.FC<ModelManagerProps> = ({
  isOpen,
  onClose,
  onModelSelect,
  selectedModel
}) => {
  console.log('ModelManager rendering, isOpen:', isOpen);
  const [installedModels, setInstalledModels] = useState<OllamaModel[]>([]);
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<string, ModelDownloadProgress>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number; modelName: string }>({
    isOpen: false,
    x: 0,
    y: 0,
    modelName: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await ollamaService.checkConnection();
      setIsConnected(connected);
      
      if (connected) {
        const models = await ollamaService.getModels();
        setInstalledModels(models);
      }
    } catch (err) {
      setError('Failed to load models. Make sure Ollama is running. Start Ollama with: ollama serve');
      console.error('Error loading models:', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadModel = async (modelName: string) => {
    console.log('downloadModel called with:', modelName);
    
    if (downloadingModels.has(modelName)) {
      console.log('Model already downloading, returning');
      return;
    }
    
    console.log('Setting download state for:', modelName);
    setDownloadingModels(prev => new Set(prev).add(modelName));
    setDownloadProgress(prev => ({
      ...prev,
      [modelName]: { status: 'Starting download...', completed: 0, total: 0, percentage: 0 }
    }));
    setError(null);

    try {
      console.log(`Starting download of ${modelName}...`);
      
      // Check connection first
      console.log('Checking Ollama connection...');
      const connected = await ollamaService.checkConnection();
      console.log('Connection status:', connected);
      
      if (!connected) {
        throw new Error('Ollama is not running. Please start Ollama first.');
      }
      
      console.log('Starting pullModel...');
      await ollamaService.pullModel(modelName, (progress) => {
        console.log(`Download progress for ${modelName}:`, progress);
        setDownloadProgress(prev => ({
          ...prev,
          [modelName]: progress
        }));
      });
      
      console.log(`Download completed for ${modelName}`);
      // Refresh models list after successful download
      await loadModels();
    } catch (err) {
      console.error(`Download failed for ${modelName}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to download ${modelName}: ${errorMessage}`);
      
      // Don't crash the app, just show the error
      console.error('Model download error:', err);
    } finally {
      console.log('Cleaning up download state for:', modelName);
      setDownloadingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelName);
        return newSet;
      });
    }
  };

  const deleteModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete ${modelName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await ollamaService.deleteModel(modelName);
      await loadModels();
      
      // If the deleted model was selected, clear the selection
      if (selectedModel === modelName) {
        onModelSelect('');
      }
    } catch (err) {
      setError(`Failed to delete ${modelName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatModelSize = (size: number) => {
    const gb = size / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)}GB`;
  };

  if (!isOpen) return null;

  // Defensive check to prevent rendering objects
  const safeProgress = (progress: ModelDownloadProgress | undefined) => {
    if (!progress) return null;
    return {
      status: String(progress.status || 'Downloading...'),
      percentage: Number(progress.percentage || 0)
    };
  };

  const openContextMenu = (e: React.MouseEvent, modelName: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Opening model context menu for:', modelName, 'at:', e.clientX, e.clientY);
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      modelName,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, x: 0, y: 0, modelName: '' });
  };

  const handleContextMenuAction = (action: string) => {
    const modelName = contextMenu.modelName;
    closeContextMenu();
    
    switch (action) {
      case 'delete':
        deleteModel(modelName);
        break;
      case 'select':
        onModelSelect(modelName);
        // Show success feedback
        console.log(`Model ${modelName} selected successfully`);
        break;
    }
  };

  const handleModelSelect = (modelName: string) => {
    onModelSelect(modelName);
    // Provide visual feedback
    console.log(`Model ${modelName} selected for chat`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">Model Manager</h2>
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
              isConnected ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            {selectedModel && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-blue-600/20 text-blue-400">
                <CheckCircle className="w-3 h-3" />
                Selected: {selectedModel}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadModels}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-600/20 border-b border-red-600/30">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-600/30 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex h-[calc(90vh-140px)]">
          {/* Installed Models */}
          <div className="w-1/2 border-r border-gray-700 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Installed Models</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : installedModels.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No models installed</p>
                <p className="text-sm mt-2">Download a model from the Popular Models section</p>
              </div>
            ) : (
              <div className="space-y-3">
                {installedModels.map((model) => (
                  <div
                    key={model.name}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedModel === model.name
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                    onClick={() => handleModelSelect(model.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{model.name}</h4>
                          {selectedModel === model.name && (
                            <CheckCircle className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {formatModelSize(model.size)} • {model.details?.parameter_size || 'Unknown'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => openContextMenu(e, model.name)}
                        className="p-2 hover:bg-gray-600/20 text-gray-400 rounded-md transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Models */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Models</h3>
            <div className="space-y-3">
              {POPULAR_MODELS.map((model) => {
                const isInstalled = installedModels.some(m => m.name === model.name);
                const isDownloading = downloadingModels.has(model.name);
                const progress = downloadProgress[model.name];

                return (
                  <div
                    key={model.name}
                    className="p-4 rounded-lg border border-gray-700 bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{model.name}</h4>
                          {isInstalled && (
                            <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                              Installed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{model.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{model.size}</span>
                          <div className="flex gap-1">
                            {model.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Download Progress */}
                        {isDownloading && progress && (
                          <div className="mt-3">
                            {(() => {
                              const safe = safeProgress(progress);
                              if (!safe) return null;
                              return (
                                <>
                                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                    <span>{safe.status}</span>
                                    <span>{safe.percentage}%</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${safe.percentage}%` }}
                                    />
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {isInstalled && (
                          <button
                            onClick={() => handleModelSelect(model.name)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                              selectedModel === model.name
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                            }`}
                          >
                            {selectedModel === model.name ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Selected
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Use This Model
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => downloadModel(model.name)}
                          disabled={isInstalled || isDownloading}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            isInstalled
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : isDownloading
                              ? 'bg-blue-600 text-white cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isDownloading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Downloading...
                            </>
                          ) : isInstalled ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Installed
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Global Download Progress Bar */}
        {downloadingModels.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-white font-medium">
                    Downloading {downloadingModels.size} model{downloadingModels.size > 1 ? 's' : ''}...
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {Array.from(downloadingModels).join(', ')}
                </span>
              </div>
              
              {/* Overall Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(() => {
                      const progresses = Array.from(downloadingModels).map(name => downloadProgress[name]);
                      const validProgresses = progresses.filter(p => p && p.percentage !== undefined);
                      if (validProgresses.length === 0) return 0;
                      const avgProgress = validProgresses.reduce((sum, p) => sum + (p?.percentage || 0), 0) / validProgresses.length;
                      return Math.round(avgProgress);
                    })()}%` 
                  }}
                />
              </div>
              
              {/* Individual Progress Details */}
              <div className="mt-3 space-y-2">
                {Array.from(downloadingModels).map((modelName) => {
                  const progress = downloadProgress[modelName];
                  const safe = safeProgress(progress);
                  if (!safe) return null;
                  
                  return (
                    <div key={modelName} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{modelName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">{safe.status}</span>
                        <span className="text-blue-400 font-medium">{safe.percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleContextMenuAction('select')}
            className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 flex items-center gap-2 text-sm"
          >
            <CheckCircle size={14} />
            Select Model
          </button>
          <button
            onClick={() => handleContextMenuAction('delete')}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-sm"
          >
            <Trash2 size={14} />
            Delete Model
          </button>
        </div>
      )}
    </div>
  );
}; 