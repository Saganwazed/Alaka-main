import React from 'react';
import { X, MessageSquare, Calendar, RotateCcw, Trash2, MoreVertical } from 'lucide-react';
import { ChatSession } from '../types';

interface ArchiveProps {
  isOpen: boolean;
  archivedSessions: ChatSession[];
  onClose: () => void;
  onUnarchive: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  theme: any;
}

export const Archive: React.FC<ArchiveProps> = ({
  isOpen,
  archivedSessions,
  onClose,
  onUnarchive,
  onDelete,
  theme,
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
            <RotateCcw size={20} />
            Archive
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {archivedSessions.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Archived Chats</h3>
              <p className="text-gray-500">Archived chats will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-4">
                {archivedSessions.length} archived chat{archivedSessions.length !== 1 ? 's' : ''}
              </div>
              
              {archivedSessions.map((session) => (
                <div
                  key={session.id}
                  className="group bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
                        <h3 className="text-white font-medium truncate">
                          {session.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{session.updatedAt.toLocaleDateString()}</span>
                        </div>
                        <span>•</span>
                        <span>{session.messages.length} messages</span>
                      </div>
                      
                      {session.messages.length > 0 && (
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {session.messages[session.messages.length - 1]?.content.slice(0, 100)}
                          {session.messages[session.messages.length - 1]?.content.length > 100 && '...'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onUnarchive(session.id)}
                        className="p-2 hover:bg-green-600/20 text-green-400 rounded-lg transition-colors"
                        title="Unarchive"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(session.id)}
                        className="p-2 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 