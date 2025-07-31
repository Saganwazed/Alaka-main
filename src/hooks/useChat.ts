import { useState, useCallback, useEffect } from 'react';
import { Message, ChatSession } from '../types';
import { useOllamaContext } from '../contexts/OllamaContext';
import { OllamaMessage } from '../services/ollama';

export const useChat = (currentModel?: string) => {
  const { sendMessage: sendOllamaMessage, isConnected, selectedModel, isEnabled } = useOllamaContext();
  
  // Use the passed currentModel if available, otherwise fall back to selectedModel from context
  const effectiveModel = currentModel || selectedModel;
  
  console.log('useChat: Model selection:', {
    currentModel,
    selectedModel,
    effectiveModel,
    isEnabled,
    isConnected
  });
  
  // Log when model changes
  useEffect(() => {
    console.log('=== USE CHAT MODEL CHANGE DEBUG ===');
    console.log('useChat: Model changed to:', effectiveModel);
    console.log('useChat: currentModel prop:', currentModel);
    console.log('useChat: selectedModel from context:', selectedModel);
    console.log('=== END USE CHAT MODEL CHANGE DEBUG ===');
  }, [effectiveModel, currentModel, selectedModel]);
  
  console.log('useChat: OllamaContext values:', {
    isEnabled,
    isConnected,
    selectedModel,
    effectiveModel
  });
  
  // Add a check to ensure context is properly initialized
  const isContextReady = isEnabled !== undefined && isConnected !== undefined && effectiveModel !== undefined;
  console.log('useChat: Context ready:', isContextReady);
  
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      name: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [archivedSessions, setArchivedSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState('1');

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        createSession();
      }
    }
  }, [activeSessionId, sessions, createSession]);

  const renameSession = useCallback((sessionId: string, newName: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, name: newName, updatedAt: new Date() }
          : s
      )
    );
  }, []);

  const archiveSession = useCallback((sessionId: string) => {
    const sessionToArchive = sessions.find(s => s.id === sessionId);
    if (!sessionToArchive) return;

    // Remove from active sessions
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // Add to archived sessions
    setArchivedSessions(prev => [sessionToArchive, ...prev]);
    
    // If this was the active session, switch to another one
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        createSession();
      }
    }
  }, [sessions, activeSessionId, createSession]);

  const unarchiveSession = useCallback((sessionId: string) => {
    const sessionToUnarchive = archivedSessions.find(s => s.id === sessionId);
    if (!sessionToUnarchive) return;

    // Remove from archived sessions
    setArchivedSessions(prev => prev.filter(s => s.id !== sessionId));
    
    // Add back to active sessions
    setSessions(prev => [sessionToUnarchive, ...prev]);
  }, [archivedSessions]);

  const sendMessage = useCallback(async (content: string) => {
    console.log('=== sendMessage called ===');
    console.log('Content:', content);
    console.log('Active session:', activeSession);
    console.log('OllamaContext values:', { isEnabled, isConnected, selectedModel, effectiveModel });
    
    if (!activeSession) {
      console.error('No active session found');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date(),
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      type: 'ai',
      timestamp: new Date(),
      isTyping: true,
    };

    console.log('Creating messages:', { userMessage, aiMessage });

    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage, aiMessage],
              updatedAt: new Date(),
              name: s.messages.length === 0 ? content.slice(0, 30) + '...' : s.name,
            }
          : s
      )
    );

    // Debug logging
    console.log('Ollama settings:', {
      enabled: isEnabled,
      isConnected,
      selectedModel: selectedModel,
      effectiveModel: effectiveModel
    });
    
    // Use Ollama if enabled and connected
    console.log('Final decision:', { isEnabled, isConnected, effectiveModel });
    console.log('Condition check:', {
      isEnabled: isEnabled,
      isConnected: isConnected,
      effectiveModel: effectiveModel,
      allTrue: isEnabled && isConnected && effectiveModel
    });
    console.log('Chat will use:', isEnabled && isConnected && effectiveModel ? 'Ollama' : 'Demo mode');
    
    // Check if we have a model selected
    const hasModel = effectiveModel && effectiveModel.trim() !== '';
    
    if (!isEnabled || !isConnected || !hasModel) {
      console.error('=== OLLAMA CONDITIONS NOT MET ===');
      console.error('isEnabled:', isEnabled);
      console.error('isConnected:', isConnected);
      console.error('hasModel:', hasModel);
      console.error('effectiveModel:', effectiveModel);
      throw new Error('Ollama is not properly configured. Please check your connection and model selection in the Brains panel.');
    }
    
    // Force check if we can actually connect to Ollama
    const canConnectToOllama = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        return response.ok;
      } catch (error) {
        console.log('Cannot connect to Ollama:', error);
        return false;
      }
    };
    
    // Always try to use Ollama - no demo mode
    if (isEnabled && isConnected && hasModel) {
      console.log('=== STARTING OLLAMA CHAT ===');
      console.log('Starting Ollama chat with model:', effectiveModel);
      console.log('Model availability check passed');
      
      // Test the connection first
      try {
        const testResponse = await fetch('http://localhost:11434/api/tags');
        const testData = await testResponse.json();
        console.log('Ollama connection test successful:', testData);
        
        // Check if our selected model is available
        const availableModels = testData.models || [];
        const modelAvailable = availableModels.find((m: any) => m.name === effectiveModel);
        console.log('Model availability check:', {
          selectedModel,
          effectiveModel,
          availableModels: availableModels.map((m: any) => m.name),
          modelAvailable: !!modelAvailable
        });
        
        if (!modelAvailable) {
          console.error('=== MODEL NOT FOUND ERROR ===');
          console.error('Selected model:', effectiveModel);
          console.error('Available models:', availableModels.map((m: any) => m.name));
          throw new Error(`Selected model ${effectiveModel} not found in available models`);
        }
      } catch (error) {
        console.error('Ollama connection test failed:', error);
        throw error;
      }
      
      try {
        // Convert chat history to Ollama format
        const ollamaMessages: OllamaMessage[] = [
          {
            role: 'system',
            content: 'You are a helpful AI assistant running locally on the user\'s device.',
          },
          ...activeSession.messages.map((msg): OllamaMessage => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: content,
          },
        ];

        console.log('Sending messages to Ollama:', ollamaMessages);
        console.log('Messages JSON:', JSON.stringify(ollamaMessages, null, 2));
        console.log('useChat: Using model for this request:', effectiveModel);

        // Stream response from Ollama
        const stream = sendOllamaMessage(ollamaMessages, effectiveModel);
        let fullResponse = '';
        let chunkCount = 0;

        console.log('Starting to read stream...');
        for await (const chunk of stream) {
          chunkCount++;
          fullResponse += chunk;
          console.log(`Received chunk ${chunkCount}:`, chunk);
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === aiMessage.id
                        ? { ...m, content: fullResponse, isTyping: true }
                        : m
                    ),
                  }
                : s
            )
          );
        }

        console.log('Ollama chat completed successfully. Total chunks:', chunkCount);

        // Mark as complete
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === aiMessage.id
                      ? { ...m, content: fullResponse, isTyping: false }
                      : m
                  ),
                }
              : s
          )
        );
      } catch (error) {
        console.error('Ollama chat error:', error);
        console.error('Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        // Show error message to user
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === aiMessage.id
                      ? { 
                          ...m, 
                          content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to Ollama'}. Please check your Ollama connection and try again.`, 
                          isTyping: false 
                        }
                      : m
                  ),
                }
              : s
          )
        );
      }
    } else {
      // Show error if Ollama is not properly configured
      console.error('Ollama not properly configured:', { isEnabled, isConnected, selectedModel });
      setSessions(prev =>
        prev.map(s =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map(m =>
                  m.id === aiMessage.id
                    ? { 
                        ...m, 
                        content: 'Error: Ollama is not properly configured. Please check your connection and model selection in the Brains panel.', 
                        isTyping: false 
                      }
                    : m
                ),
              }
            : s
        )
      );
    }
  }, [activeSession, activeSessionId, sendOllamaMessage, isConnected]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!activeSession) return;

    // Find the message to regenerate
    const messageIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Get the user message that prompted this response
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;

    const userMessage = activeSession.messages[userMessageIndex];
    if (userMessage.type !== 'user') return;

    // Mark as regenerating
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.map(m =>
                m.id === messageId
                  ? { ...m, content: '', isTyping: true }
                  : m
              ),
            }
          : s
      )
    );

    // Use Ollama if enabled and connected
    if (isEnabled && isConnected && selectedModel) {
      try {
        // Convert chat history up to the user message to Ollama format
        const historyMessages = activeSession.messages.slice(0, userMessageIndex + 1);
        const ollamaMessages: OllamaMessage[] = [
          {
            role: 'system',
            content: 'You are a helpful AI assistant running locally on the user\'s device.',
          },
          ...historyMessages.map((msg): OllamaMessage => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
        ];

        // Stream response from Ollama
        console.log('useChat: Regenerating with model:', effectiveModel);
        const stream = sendOllamaMessage(ollamaMessages, effectiveModel);
        let fullResponse = '';

        for await (const chunk of stream) {
          fullResponse += chunk;
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === messageId
                        ? { ...m, content: fullResponse, isTyping: true }
                        : m
                    ),
                  }
                : s
            )
          );
        }

        // Mark as complete
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === messageId
                      ? { ...m, content: fullResponse, isTyping: false }
                      : m
                  ),
                }
              : s
          )
        );
      } catch (error) {
        console.error('Ollama regeneration error:', error);
        // Fallback to mock response
        setTimeout(() => {
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === messageId
                        ? { 
                            ...m, 
                            content: 'Sorry, I encountered an error while regenerating the response. Please try again.', 
                            isTyping: false 
                          }
                        : m
                    ),
                  }
                : s
            )
          );
        }, 1500);
      }
    } else {
      // Fallback to mock response
      setTimeout(() => {
        const responses = [
          "Let me provide a different perspective on that...",
          "Here's an alternative approach to consider...",
          "I can offer another way to think about this...",
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === messageId
                      ? { ...m, content: response, isTyping: false }
                      : m
                  ),
                }
              : s
          )
        );
      }, 1500);
    }
  }, [activeSession, activeSessionId, sendOllamaMessage, isConnected]);

  const deleteMessage = useCallback((messageId: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.filter(m => m.id !== messageId),
            }
          : s
      )
    );
  }, [activeSessionId]);

  return {
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
  };
};