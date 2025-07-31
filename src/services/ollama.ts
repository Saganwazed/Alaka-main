export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  modified_at: string;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface ModelDownloadProgress {
  status: string;
  completed: number;
  total: number;
  percentage: number;
}

export class OllamaService {
  private baseUrl = 'http://localhost:11434';
  private isConnected = false;

  async checkConnection(): Promise<boolean> {
    try {
      console.log('OllamaService: Attempting to connect to', `${this.baseUrl}/api/tags`);
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      console.log('OllamaService: Response status:', response.status);
      
      if (!response.ok) {
        console.log('OllamaService: Response not ok, status:', response.status);
        this.isConnected = false;
        return false;
      }
      
      // Try to parse the response to ensure it's valid JSON
      const data = await response.json();
      console.log('OllamaService: Response data:', data);
      
      this.isConnected = true;
      console.log('OllamaService: Connection successful');
      return true;
    } catch (error) {
      console.error('OllamaService: Connection error:', error);
      this.isConnected = false;
      return false;
    }
  }

  async getModels(): Promise<OllamaModel[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('OllamaService: Models data:', data);
      return data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  async pullModel(modelName: string, onProgress?: (progress: ModelDownloadProgress) => void, abortSignal?: AbortSignal): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
      
      // If external abort signal is provided, listen to it
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          controller.abort();
        });
      }
      
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: true,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to pull model');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      let totalSize = 0;
      let completedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status && onProgress) {
              // Parse download progress - handle both old and new formats
              if (data.status.includes('pulling') && data.completed && data.total) {
                // New format with completed/total fields
                const completed = data.completed;
                const total = data.total;
                onProgress({
                  status: data.status,
                  completed: completed,
                  total: total,
                  percentage: Math.round((completed / total) * 100)
                });
              } else if (data.status.includes('downloading')) {
                // Old format with status containing progress
                const match = data.status.match(/(\d+)\/(\d+)/);
                if (match) {
                  const completedSize = parseInt(match[1]);
                  const totalSize = parseInt(match[2]);
                  onProgress({
                    status: data.status,
                    completed: completedSize,
                    total: totalSize,
                    percentage: Math.round((completedSize / totalSize) * 100)
                  });
                }
              } else {
                // Other status messages
                onProgress({
                  status: data.status,
                  completed: 0,
                  total: 0,
                  percentage: 0
                });
              }
            }
          } catch (e) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    } catch (error) {
      console.error('Error pulling model:', error);
      throw error;
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete model');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }

  async getModelInfo(modelName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get model info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  }

  async *streamChat(request: OllamaChatRequest): AsyncGenerator<string, void, unknown> {
    try {
      console.log('OllamaService: Starting stream chat with request:', request);
      
      const requestBody = {
        ...request,
        stream: true,
      };
      console.log('OllamaService: Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('OllamaService: Chat response status:', response.status);
      console.log('OllamaService: Chat response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OllamaService: Chat request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to start chat stream: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      console.log('OllamaService: Starting to read stream...');
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('OllamaService: Stream completed');
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data: OllamaChatResponse = JSON.parse(line);
            console.log('OllamaService: Parsed chunk:', data);
            
            if (data.message?.content) {
              chunkCount++;
              console.log(`OllamaService: Yielding chunk ${chunkCount}:`, data.message.content);
              yield data.message.content;
            }
            if (data.done) {
              console.log('OllamaService: Stream done, total chunks:', chunkCount);
              return;
            }
          } catch (e) {
            console.warn('OllamaService: Failed to parse chunk:', line, e);
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    } catch (error) {
      console.error('OllamaService: Error in chat stream:', error);
      throw error;
    }
  }

  async chat(request: OllamaChatRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send chat request');
      }

      const data: OllamaChatResponse = await response.json();
      return data.message?.content || '';
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const ollamaService = new OllamaService();