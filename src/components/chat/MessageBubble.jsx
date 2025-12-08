import React from 'react';
// IMPORT NARZĘDZIA
import { formatDate } from '../../utils/formatDate'; // Ścieżka o jeden poziom wyżej (components/chat -> utils)

const MessageBubble = ({ message, isMe }) => {
  // Usunęliśmy funkcję formatMessageDate, bo mamy teraz formatDate

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl p-4 ${
        isMe 
          ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-none' 
          : 'bg-surface border border-white/10 text-gray-200 rounded-bl-none'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
          {/* UŻYCIE formatDate */}
          <span>{formatDate(message.created_at, { relative: true })}</span>
          {isMe && <span>{message.is_read ? '✓✓' : '✓'}</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;