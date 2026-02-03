
import React, { useState, useEffect, useRef } from 'react';
import { Chat, ChatMessage } from '../types';
import { sendChatMessage, subscribeToMessages, markChatAsRead } from '../services/geminiService';

interface ChatManagerProps {
  chats: Chat[];
  activeChatId: string | null;
  onClose: () => void;
  onSelectChat: (chatId: string | null) => void;
  currentUserEmail: string;
}

const ChatManager: React.FC<ChatManagerProps> = ({ 
  chats, 
  activeChatId, 
  onClose, 
  onSelectChat,
  currentUserEmail 
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    if (activeChatId) {
      markChatAsRead(activeChatId, currentUserEmail);
      const unsubscribe = subscribeToMessages(activeChatId, (msgs) => {
        setMessages(msgs);
      });
      return () => unsubscribe();
    }
  }, [activeChatId, currentUserEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: any) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !activeChat) return;

    const recipient = activeChat.participants.find((p: string) => p !== currentUserEmail);
    const messageText = inputText;
    setInputText('');
    
    await sendChatMessage(activeChatId, currentUserEmail, messageText, recipient);
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-[100] w-full sm:w-[420px] h-full sm:h-[650px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-white/5" dir="rtl">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          {activeChatId ? (
            <>
              <button 
                onClick={() => onSelectChat(null)} 
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <img src={activeChat?.productImage} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white">{activeChat?.sellerName === currentUserEmail ? activeChat?.buyerName : activeChat?.sellerName}</span>
                  <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest truncate max-w-[120px]">{activeChat?.productTitle}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 px-2">
              <span className="text-lg font-black text-white uppercase tracking-tight">المحادثات</span>
            </div>
          )}
        </div>

        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {!activeChatId ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chats.length > 0 ? chats.map(chat => (
              <button 
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-right border ${chat.unread ? 'bg-indigo-600/10 border-indigo-500/20 shadow-lg' : 'bg-slate-900/40 border-white/5'}`}
              >
                <div className="relative">
                  <img src={chat.productImage} className="w-14 h-14 rounded-2xl object-cover border border-white/5" alt="" />
                  {chat.unread && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-black text-white">{chat.participants.includes(currentUserEmail) && chat.sellerName === currentUserEmail ? chat.buyerName : chat.sellerName}</span>
                  </div>
                  <div className="text-[10px] text-indigo-400 font-bold truncate mb-1">{chat.productTitle}</div>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-20">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <p className="font-black uppercase tracking-widest text-[10px] mt-4">لا توجد رسائل</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
              {messages.map((msg, idx) => {
                const isMe = msg.sender === currentUserEmail;
                const isSystem = msg.sender === 'system';
                
                if (isSystem) return (
                  <div key={idx} className="w-full py-4 px-6 bg-white/5 rounded-2xl border border-white/10 my-2 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">{msg.text}</p>
                  </div>
                );

                return (
                  <div key={idx} className={`flex w-full flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                    <div className={`relative max-w-[85%] px-5 py-3.5 rounded-3xl ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="mt-1 text-[9px] text-slate-600 font-black px-2">{formatTime(msg.timestamp)}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-white/5 flex gap-3">
              <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="اكتب رسالة..."
                className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-right"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xl active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatManager;
