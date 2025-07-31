import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Trash2, Download, X, Mic, MicOff, PanelLeft, Plus } from 'lucide-react';
import { Message, ChatSession } from '../types';
import { useOllamaContext } from '../contexts/OllamaContext';
import { TypingAnimation } from './TypingAnimation';
import { MessageBubble } from './MessageBubble';
import { useOllama } from '../hooks/useOllama';

interface ChatInterfaceProps {
  activeSession: ChatSession | undefined;
  onSendMessage: (content: string) => void;
  onRegenerateResponse: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onOpenCommandBar: () => void;
  theme: any;
  sidebarOpen: boolean;
  documentMode: boolean;
  voiceInputActive: boolean;
  onToggleDocumentMode: () => void;
  onToggleVoiceInput: () => void;
  currentModel?: string;
  availableModels?: string[];
  onModelSelect?: (modelName: string) => void;
  onToggleSidebar?: () => void;
  onCreateSession?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeSession,
  onSendMessage,
  onRegenerateResponse,
  onDeleteMessage,
  onOpenCommandBar,
  theme,
  sidebarOpen,
  documentMode,
  voiceInputActive,
  onToggleDocumentMode,
  onToggleVoiceInput,
  currentModel,
  availableModels = [],
  onModelSelect,
  onToggleSidebar,
  onCreateSession,
}) => {
  const { isConnected, isLoading, settings: ollamaSettings, error, checkConnection, models } = useOllama();
  const { isEnabled, selectedModel } = useOllamaContext();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '20px';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Debug function to test Ollama state
  const debugOllamaState = () => {
    const state = {
      isEnabled: isEnabled,
      isConnected: isConnected,
      selectedModel: selectedModel,
      models: models?.map(m => m.name) || [],
      error: error
    };
    console.log('Debug Ollama State:', state);
    
    // Test direct connection to Ollama
    fetch('http://localhost:11434/api/tags')
      .then(response => response.json())
      .then(data => {
        console.log('Direct Ollama test successful:', data);
        alert(`Ollama Debug Info:
Enabled: ${isEnabled}
Connected: ${isConnected}
Selected Model: ${selectedModel || 'None'}
Available Models: ${models?.map(m => m.name).join(', ') || 'None'}
Error: ${error || 'None'}

Direct Ollama Test: ✅ SUCCESS
Available Models: ${data.models?.map((m: any) => m.name).join(', ')}`);
      })
      .catch(error => {
        console.error('Direct Ollama test failed:', error);
        alert(`Ollama Debug Info:
Enabled: ${isEnabled}
Connected: ${isConnected}
Selected Model: ${selectedModel || 'None'}
Available Models: ${models?.map(m => m.name).join(', ') || 'None'}
Error: ${error || 'None'}

Direct Ollama Test: ❌ FAILED
Error: ${error.message}`);
      });
  };

  const getBackgroundStyle = () => {
    const baseStyle: React.CSSProperties = {};
    
    if (theme.backgroundType === 'gradient') {
      baseStyle.background = theme.backgroundGradient;
    } else if (theme.backgroundType === 'image' && theme.backgroundImage) {
      baseStyle.backgroundImage = `url(${theme.backgroundImage})`;
      baseStyle.backgroundSize = 'cover';
      baseStyle.backgroundPosition = 'center';
      if (theme.backgroundBlur > 0) {
        baseStyle.filter = `blur(${theme.backgroundBlur}px)`;
      }
    } else {
      baseStyle.backgroundColor = theme.backgroundColor;
    }
    
    if (theme.backgroundOpacity < 1) {
      baseStyle.opacity = theme.backgroundOpacity;
    }
    
    return baseStyle;
  };

  return (
    <div 
      className="flex-1 flex flex-col transition-all duration-300 min-h-screen pt-4"
      style={getBackgroundStyle()}
    >

      {/* Header with Model Selector */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800/30 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - App name and controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleSidebar}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                title="Toggle Sidebar"
              >
                <PanelLeft size={16} />
              </button>
              <button
                onClick={onCreateSession}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                title="New Chat"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Alaka</h1>
              <span className="px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-800/50 border border-gray-700 rounded-full">
                Beta 0
              </span>
            </div>
          </div>
          
          {/* Right side - Model Selector */}
          <div className="flex items-center gap-2">
            {currentModel && availableModels.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">Model:</span>
                <select
                  value={currentModel}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    console.log('=== CHAT INTERFACE MODEL CHANGE ===');
                    console.log('ChatInterface: Model changed to:', newModel);
                    console.log('ChatInterface: Previous model:', currentModel);
                    onModelSelect?.(newModel);
                    // Also update the Ollama settings directly
                    const ollamaSettings = JSON.parse(localStorage.getItem('ollama-settings') || '{}');
                    ollamaSettings.selectedModel = newModel;
                    localStorage.setItem('ollama-settings', JSON.stringify(ollamaSettings));
                    console.log('ChatInterface: Updated Ollama settings:', ollamaSettings);
                    // Dispatch custom event to notify useOllama hook
                    window.dispatchEvent(new CustomEvent('ollama-model-changed', { 
                      detail: { selectedModel: newModel } 
                    }));
                    console.log('ChatInterface: Dispatched ollama-model-changed event');
                    console.log('=== END CHAT INTERFACE MODEL CHANGE ===');
                  }}
                  className="px-3 py-1.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {!currentModel && (
              <div className="text-sm text-gray-400">
                No model selected
              </div>
            )}
            {/* Debug button */}
            <button
              onClick={debugOllamaState}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
              title="Debug Ollama Connection"
            >
              Debug
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
                   <div className="flex-1 overflow-y-auto p-8 space-y-6 mt-28">
        
        {activeSession?.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-8">Start a conversation</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 px-4 py-2">
            {activeSession?.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                theme={theme}
                onRegenerate={() => onRegenerateResponse(message.id)}
                onDelete={() => onDeleteMessage(message.id)}
                onEdit={(content) => {
                  // Handle edit functionality
                  console.log('Edit message:', content);
                }}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-700/30 backdrop-blur-sm bg-black">
        <form onSubmit={handleSubmit} className="relative">
          <div 
            className={`flex items-end gap-2 p-2 rounded-2xl shadow-2xl transition-all duration-200 hover:shadow-3xl ${
              theme.glassmorphism 
                ? 'bg-gray-800/90 backdrop-blur-xl border border-white/20' 
                : 'bg-gray-800/90 border border-gray-600'
            }`}
          >
            <button
              type="button"
              onClick={onToggleVoiceInput}
              className={`p-1.5 rounded-xl transition-all ${
                voiceInputActive
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={voiceInputActive ? "Stop voice input" : "Start voice input"}
            >
              {voiceInputActive ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={documentMode ? "Start writing your document..." : "Type your message..."}
              className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none min-h-[16px] max-h-[60px] leading-relaxed"
              style={{
                fontFamily: theme.fontFamily,
                fontSize: `${theme.fontSize}px`,
                backgroundColor: 'transparent',
              }}
            />
            
            <button
              type="submit"
              disabled={!input.trim()}
              title="Send message"
              className={`p-2 rounded-xl transition-all transform hover:scale-105 active:scale-95 ${
                input.trim()
                  ? 'shadow-lg hover:shadow-xl'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
              style={input.trim() ? { 
                backgroundColor: theme.accentColor,
                boxShadow: `0 4px 20px ${theme.accentColor}40`
              } : {}}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};