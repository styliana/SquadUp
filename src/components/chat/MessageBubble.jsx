import React from 'react';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn'; // Używamy utility do łączenia klas

const MessageBubble = ({ message, isMe }) => {
  return (
    <div className={cn("flex", isMe ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        "max-w-[75%] rounded-2xl p-4 shadow-sm relative", 
        isMe 
          ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-none' 
          : 'bg-surface border border-border text-textMain rounded-bl-none'
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        
        <div className={cn(
            "text-[10px] mt-1 text-right flex items-center justify-end gap-1 opacity-70",
            isMe ? 'text-blue-100' : 'text-textMuted'
        )}>
          <span>{formatDate(message.created_at, { relative: true })}</span>
          {isMe && <span>{message.is_read ? '✓✓' : '✓'}</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;