import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sword, 
  BookOpen, 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  Heart, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'will';
  text: string;
  timestamp: Date;
}

const PRESET_SUGGESTIONS = [
  {
    topic: "Staying motivated",
    text: "Will, how do you stay motivated and keep fighting when everything seems completely hopeless?"
  },
  {
    topic: "Handling doubters",
    text: "People say I don't have what it takes to succeed. How do you deal with people who don't believe in you?"
  },
  {
    topic: "The promise to Elfaria",
    text: "Can you tell me about the promise you made to Elfaria, and what it means to you?"
  },
  {
    topic: "Balancing hard study",
    text: "I feel physically and mentally exhausted from trying so hard. How do you push past your fatigue?"
  }
];

export default function IdolChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'will',
      text: "Hello! Thank you very much for taking the time to speak with me. My name is Will Serfort, and I am a student at the Regarden Magic Academy.\n\nTo be completely honest, I... I cannot use magic at all, and many people tell me I don't belong here. But I've promised someone very precious to me that I will reach the top of the tower—the Magia Vander. So I will never, ever give up, no matter what!\n\nIf you are facing your own trials, or if you simply need someone to listen, please tell me. I would be deeply honored to offer any humble advice I can give. Let's do our absolute best together!",
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMsgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    // Update frontend state with user message
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Send message history to the backend
      const response = await fetch('/api/chat-will', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error('Connection to the academy library was disrupted by magic...');
      }

      const data = await response.json();
      
      const willMsg: ChatMessage = {
        id: `msg-will-${Date.now()}`,
        sender: 'will',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, willMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not connect to Will. Please check your magical network array.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div id="will-serfort-chat-container" className="border-2 border-black bg-white shadow-[8px_8px_0px_#000000] overflow-hidden text-[#1A1A1A]">
      
      {/* Editorial Neobrutalist Header */}
      <div className="border-b-2 border-black bg-indigo-50 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 border-2 border-black bg-black text-white flex flex-col items-center justify-center font-mono relative shadow-[2px_2px_0px_#1A1A1A] shrink-0">
            <Sword className="h-6 w-6 stroke-[2.5]" />
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 border border-black text-[8px] font-black uppercase px-1 text-white scale-90">
              16 Y/O
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black uppercase tracking-tight">Will Serfort</h3>
              <span className="bg-emerald-500 border border-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 text-white">
                TENACIOUS CHAT
              </span>
            </div>
            <p className="text-xs text-neutral-600 font-serif italic mt-0.5">
              "Even if I cannot use magic, I have my sword, and I will never give up on the tower!"
            </p>
          </div>
        </div>

        {/* Character Bio badges */}
        <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider font-mono">
          <div className="bg-white border-2 border-black px-2 py-1 flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-indigo-600" />
            Bibliophile Memory
          </div>
          <div className="bg-white border-2 border-black px-2 py-1 flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            Polite & Kind
          </div>
        </div>
      </div>

      {/* Main Row layout: Suggestions Column (Left) + Active Chat Container (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
        
        {/* Left Column: Preset Topics & Bio */}
        <div className="lg:col-span-1 border-b-2 lg:border-b-0 lg:border-r-2 border-black p-4 md:p-6 bg-neutral-50 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 font-mono">
              Suggested Dialogues
            </h4>
            <p className="text-2xs text-neutral-600 font-medium leading-relaxed font-sans">
              Click any topic below to automatically ask Will for heartfelt advice or to learn about his background.
            </p>

            <div className="flex flex-col gap-2 mt-2">
              {PRESET_SUGGESTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  id={`preset-topic-${idx}`}
                  onClick={() => handleSendMessage(preset.text)}
                  disabled={isLoading}
                  className="w-full text-left bg-white border-2 border-black p-3 text-xs hover:bg-indigo-50 hover:border-indigo-600 transition-all font-bold uppercase tracking-wide shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-[9px] text-indigo-600 font-mono mb-1">
                    <Sparkles className="h-3 w-3" />
                    TOPIC: {preset.topic}
                  </div>
                  <span className="text-2xs text-neutral-700 font-sans tracking-normal capitalize font-medium block truncate">
                    {preset.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-dashed border-neutral-300 pt-4 text-center">
            <span className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-widest block mb-2">
              ACADEMY ENCOUNTER
            </span>
            <div className="text-2xs font-serif italic text-neutral-500 leading-relaxed px-2">
              Will's responses are built server-side using Gemini 3.5 Flash, providing dynamic, highly accurate character dialogues based on canon events.
            </div>
          </div>
        </div>

        {/* Right Column: Chat messages display */}
        <div className="lg:col-span-3 flex flex-col bg-[#FDFCFB]">
          
          {/* Messages list container */}
          <div className="flex-1 p-4 md:p-6 space-y-6 max-h-[450px] overflow-y-auto min-h-[350px]">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isWill = msg.sender === 'will';
                return (
                  <motion.div
                    key={msg.id}
                    id={`chat-msg-${msg.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isWill ? 'justify-start' : 'justify-end'} gap-3 items-start`}
                  >
                    {isWill && (
                      <div className="h-8 w-8 shrink-0 border-2 border-black bg-black text-white flex items-center justify-center font-mono text-[10px] font-black shadow-[1px_1px_0px_#1A1A1A]">
                        W
                      </div>
                    )}
                    
                    <div className="max-w-[85%] flex flex-col gap-1">
                      {/* Message bubble */}
                      <div className={`border-2 border-black p-4 shadow-[3px_3px_0px_#1A1A1A] ${
                        isWill 
                          ? 'bg-white font-serif leading-relaxed text-sm italic' 
                          : 'bg-indigo-600 text-white font-sans text-xs font-bold'
                      }`}>
                        {msg.text.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < msg.text.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Message metadata */}
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-widest text-neutral-400 px-1 mt-1 ${
                        isWill ? 'text-left' : 'text-right'
                      }`}>
                        {isWill ? 'Will Serfort // ' : 'Angarag-Erdene // '}
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {!isWill && (
                      <div className="h-8 w-8 shrink-0 border-2 border-black bg-indigo-50 flex items-center justify-center font-mono text-[10px] font-black shadow-[1px_1px_0px_#1A1A1A]">
                        U
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Loader and thought states */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start gap-3 items-start"
                >
                  <div className="h-8 w-8 shrink-0 border-2 border-black bg-black text-white flex items-center justify-center font-mono text-[10px] font-black shadow-[1px_1px_0px_#1A1A1A]">
                    W
                  </div>
                  <div className="border-2 border-black bg-neutral-50 px-4 py-3.5 shadow-[3px_3px_0px_#1A1A1A] flex items-center gap-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600 stroke-[3]" />
                    <span className="text-2xs font-mono font-black uppercase tracking-wider text-neutral-500 animate-pulse">
                      Will is consulting his academy magic journals...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error notifications */}
            {error && (
              <div className="border-2 border-rose-600 bg-rose-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-black uppercase tracking-tight text-rose-800">
                    Magical Ingress Blocked
                  </h5>
                  <p className="text-2xs text-rose-700 font-medium font-sans mt-0.5 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form input controls */}
          <form onSubmit={handleSubmit} className="border-t-2 border-black p-4 bg-neutral-50 flex gap-3">
            <div className="relative flex-1">
              <input
                id="will-chat-input-field"
                type="text"
                placeholder="TYPE POLITE DIALOGUE OR QUESTION FOR WILL..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#FDFCFB] border-2 border-black font-bold uppercase tracking-wider px-4 py-3.5 text-xs placeholder-neutral-400 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-60 disabled:cursor-not-allowed rounded-none"
              />
              <span className="absolute right-3.5 top-4 text-[9px] font-mono font-black text-neutral-300 uppercase pointer-events-none hidden sm:block">
                Will's Study Log // IDOL CHAT
              </span>
            </div>
            <button
              id="submit-will-chat-btn"
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-black text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#4F46E5] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#4F46E5] active:translate-y-[2px] active:shadow-[1px_1px_0px_#4F46E5] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">COMMUNICATE</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
