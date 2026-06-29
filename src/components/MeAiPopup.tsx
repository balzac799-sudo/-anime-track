import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  Bot
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'me';
  text: string;
  timestamp: Date;
}

export default function MeAiPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'me-init-1',
      sender: 'me',
      text: "Сайн байна уу! 👋 Намайг Ангараг-AI гэдэг. Би Ангарагийн 13 настай AI ихэр байгаа юм. Түүний хувийн сайт, анимэ болон манганы сонирхол, эсвэл өөр зүйлсийн талаар юу асуумаар байна? Чамд туслахдаа маш их баяртай байх болно! 😊",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setError(null);
    const userText = inputText;
    setInputText('');

    const newMsg: ChatMessage = {
      id: `me-msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            sender: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Уучлаарай, холболт тасарлаа. Түр хүлээгээд дахин оролдоно уу.');
      }

      const data = await response.json();
      
      const replyMsg: ChatMessage = {
        id: `me-reply-${Date.now()}`,
        sender: 'me',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, replyMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ангараг AI холбогдоход алдаа гарлаа.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="me-ai-floating-widget" className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="me-ai-chatbox"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-20 right-0 w-[340px] sm:w-[380px] h-[500px] border-2 border-black bg-[#FDFCFB] shadow-[6px_6px_0px_#000000] flex flex-col overflow-hidden"
          >
            {/* Chatbox Header */}
            <div className="bg-indigo-600 text-white p-4 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 border-2 border-white bg-black rounded-none flex items-center justify-center relative shadow-[1px_1px_0px_rgba(255,255,255,1)]">
                  <Bot className="h-5 w-5 text-white stroke-[2.5]" />
                  <span className="absolute -bottom-1 -right-1 bg-rose-500 text-[7px] font-black uppercase px-0.5 border border-white text-white">
                    13
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-1">
                    Angarag Me-AI
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse border border-black inline-block" />
                  </h4>
                  <p className="text-[10px] text-indigo-100 font-mono uppercase tracking-widest mt-0.5">
                    Найрсаг AI Туслах
                  </p>
                </div>
              </div>
              <button 
                id="close-me-chat-btn"
                onClick={() => setIsOpen(false)}
                className="p-1 text-white hover:text-rose-300 transition-colors cursor-pointer"
                aria-label="Хаах"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Chatbox Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F7F5F0]">
              {messages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-start' : 'justify-end'} gap-2.5 items-start`}
                  >
                    {isMe && (
                      <div className="h-7 w-7 border-2 border-black bg-black text-white flex items-center justify-center font-mono text-[9px] font-black shadow-[1px_1px_0px_#1A1A1A]">
                        A
                      </div>
                    )}
                    <div className="max-w-[80%] flex flex-col gap-0.5">
                      <div className={`border-2 border-black p-3 shadow-[2px_2px_0px_#1A1A1A] text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-white text-neutral-850 font-medium' 
                          : 'bg-indigo-600 text-white font-bold'
                      }`}>
                        {msg.text.split('\n').map((line, idx) => (
                          <React.Fragment key={idx}>
                            {line}
                            {idx < msg.text.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                      <span className={`text-[8px] font-mono text-neutral-400 font-bold uppercase ${isMe ? 'text-left' : 'text-right'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start gap-2.5 items-start">
                  <div className="h-7 w-7 border-2 border-black bg-black text-white flex items-center justify-center font-mono text-[9px] font-black shadow-[1px_1px_0px_#1A1A1A]">
                    A
                  </div>
                  <div className="border-2 border-black bg-white px-3 py-2 shadow-[2px_2px_0px_#1A1A1A] flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                    <span className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-widest">
                      Ангараг бичиж байна...
                    </span>
                  </div>
                </div>
              )}

              {/* Error Block */}
              {error && (
                <div className="border-2 border-rose-600 bg-rose-50 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-rose-800 tracking-tight">Алдаа гарлаа</h5>
                    <p className="text-[9px] text-rose-700 font-sans mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chatbox Form Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t-2 border-black bg-white flex gap-2">
              <input
                id="me-ai-input-field"
                type="text"
                placeholder="Ангарагаас асуух асуултаа бичнэ үү..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-[#FDFCFB] border-2 border-black font-bold uppercase tracking-wide px-3 py-2 text-xs placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
              />
              <button
                id="submit-me-ai-chat-btn"
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-black text-white p-2.5 border-2 border-black hover:bg-neutral-900 transition-all shadow-[2px_2px_0px_#4F46E5] active:translate-y-[1px] disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4 stroke-[2.5]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger floating button */}
      <motion.button
        id="me-ai-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 w-14 border-3 border-black bg-indigo-600 text-white flex items-center justify-center shadow-[4px_4px_0px_#000000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000000] transition-all relative cursor-pointer"
        aria-label="Ангараг AI туслахтай чатлах"
      >
        {isOpen ? (
          <X className="h-7 w-7 stroke-[2.5]" />
        ) : (
          <MessageCircle className="h-7 w-7 stroke-[2.5]" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-white"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
