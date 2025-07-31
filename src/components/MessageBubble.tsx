import React, { useState, useEffect } from 'react';
import { Copy, MoreVertical, RotateCcw, Edit, Trash2 } from 'lucide-react';
import { Message } from '../types';
import { TypingAnimation } from './TypingAnimation';

interface MessageBubbleProps {
  message: Message;
  theme: any;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onEdit?: (content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  theme,
  onRegenerate,
  onDelete,
  onEdit,
}) => {
  console.log('MessageBubble rendering:', message.id, message.type);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  const isUser = message.type === 'user';
  const baseClasses = `max-w-full p-4 relative group transition-all duration-200 ${
    isUser ? 'text-right' : 'text-left'
  }`;

  const messageStyle = {
    color: isUser ? theme.accentColor : '#ffffff',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleEdit = () => {
    if (isEditing && onEdit) {
      onEdit(editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate position to avoid overlapping with message
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 160; // min-w-[160px]
    const menuHeight = 120; // approximate height
    
    // Position menu to the right of the button, or left if not enough space
    let x = rect.right + 5;
    if (x + menuWidth > window.innerWidth) {
      x = rect.left - menuWidth - 5;
    }
    
    // Position menu below the button, or above if not enough space
    let y = rect.bottom + 5;
    if (y + menuHeight > window.innerHeight) {
      y = rect.top - menuHeight - 5;
    }
    
    // Ensure menu stays within viewport bounds
    x = Math.max(10, Math.min(x, window.innerWidth - menuWidth - 10));
    y = Math.max(10, Math.min(y, window.innerHeight - menuHeight - 10));
    
    console.log('Opening context menu at:', x, y);
    setContextMenu({
      isOpen: true,
      x,
      y,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, x: 0, y: 0 });
  };

  const handleContextMenuAction = (action: string) => {
    closeContextMenu();
    switch (action) {
      case 'copy':
        handleCopy();
        break;
      case 'edit':
        handleEdit();
        break;
      case 'regenerate':
        if (onRegenerate) onRegenerate();
        break;
      case 'delete':
        if (onDelete) onDelete();
        break;
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.isOpen) {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu.isOpen]);

  return (
    <div 
      className={`${baseClasses} transition-all duration-200`}
      style={messageStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent resize-none outline-none"
          style={{
            fontFamily: theme.fontFamily,
            fontSize: `${theme.fontSize}px`,
            lineHeight: theme.lineSpacing,
            color: messageStyle.color,
          }}
          autoFocus
        />
      ) : (
        <div
          className="whitespace-pre-wrap break-words"
          style={{
            fontFamily: theme.fontFamily,
            fontSize: `${theme.fontSize}px`,
            lineHeight: theme.lineSpacing,
            color: messageStyle.color,
          }}
        >
          {message.isTyping ? (
            <TypingAnimation text={message.content} />
          ) : (
            message.content
          )}
        </div>
      )}

      {/* Action menu */}
      {(isHovered || isEditing) && !message.isTyping && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              console.log('Button clicked!');
              openContextMenu(e);
            }}
            className="p-1.5 rounded-md bg-black/30 hover:bg-black/50 transition-colors cursor-pointer backdrop-blur-sm"
            title="More options"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      )}
      


      {/* Timestamp */}
      <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {message.timestamp.toLocaleTimeString()}
      </div>

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px] backdrop-blur-sm"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleContextMenuAction('copy')}
            className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 flex items-center gap-2 text-sm"
          >
            <Copy size={14} />
            Copy
          </button>
          {onEdit && (
            <button
              onClick={() => handleContextMenuAction('edit')}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 flex items-center gap-2 text-sm"
            >
              <Edit size={14} />
              {isEditing ? 'Save' : 'Edit'}
            </button>
          )}
          {!isUser && onRegenerate && (
            <button
              onClick={() => handleContextMenuAction('regenerate')}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 flex items-center gap-2 text-sm"
            >
              <RotateCcw size={14} />
              Regenerate
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => handleContextMenuAction('delete')}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-sm"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};