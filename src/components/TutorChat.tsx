import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { askTutor } from '../services/geminiService';
import { cn } from '../lib/utils';

export default function TutorChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Welcome back, Candidate. I'm AtomicTutor. My goal is to ensure you secure a Grade 7 this May by mastering both the syllabus and perfect exam technique. \n\nWhat topic shall we tackle first? \n- **Structure 2.2** (VSEPR Shapes & Hybridization) \n- **Reactivity 1.4** (Entropy & Spontaneity) \n- Or any other concept from Structure 1-3 or Reactivity 1." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askTutor(input, updatedMessages);
      setMessages(prev => [...prev, { role: 'model', text: response || '' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I had a brief enthalpy leak. Can you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full alchemy-glass rounded-xl overflow-hidden border border-zinc-800">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          <h2 className="font-medium text-sm tracking-tight text-zinc-100 uppercase">AI Alchemy Tutor</h2>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-3 max-w-[85%]",
              m.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
              m.role === 'user' ? "bg-zinc-800 border-zinc-700" : "bg-emerald-500/10 border-emerald-500/30"
            )}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-zinc-100 text-zinc-900 rounded-tr-none" 
                : "bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none"
            )}>
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-0 prose-ul:my-2 prose-li:my-0">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none italic text-zinc-500 text-xs">
              Synthesizing response...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
        <div className="relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about entropy, bonding, or isotopes..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-emerald-950 rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:grayscale transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2 text-center uppercase tracking-widest font-medium">AtomicTutor AI v1.0 • Use with Data Booklet v2025</p>
      </div>
    </div>
  );
}
