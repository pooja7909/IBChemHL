import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { askTutor } from '../services/geminiService';
import { IB_CURRICULUM } from '../constants/curriculum';
import { cn } from '../lib/utils';

interface TutorChatProps {
  initialTopicId?: string | null;
}

export default function TutorChat({ initialTopicId }: TutorChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Welcome back, Candidate. I'm AtomicTutor. My goal is to ensure you secure a Grade 7 this May by mastering both the syllabus and perfect exam technique. \n\nWhat topic shall we tackle first? \n- **Structure 2.2** (VSEPR Shapes & Hybridization) \n- **Reactivity 1.4** (Entropy & Spontaneity) \n- Or any other concept from Structure 1-3 or Reactivity 1-3." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (initialTopicId && !hasInitialized.current) {
      const topic = IB_CURRICULUM.find(t => t.id === initialTopicId);
      if (topic) {
        hasInitialized.current = true;
        const initialPrompt = `Hello tutor, let's start studying ${topic.code}: ${topic.title}. Please provide a deep explanation of the first subtopic and then grill me with questions.`;
        
        // Add user message and trigger response
        const userMessage = { role: 'user' as const, text: `MASTER PLAN: ${topic.code} - ${topic.title}` };
        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);
        askTutor(initialPrompt, [userMessage]).then(response => {
          setMessages(prev => [...prev, { role: 'model', text: response || '' }]);
        }).finally(() => {
          setIsLoading(false);
        });
      }
    }
  }, [initialTopicId]);

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
    <div className="flex flex-col h-full alchemy-glass rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
      <div className="p-4 border-b border-zinc-100 bg-white/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-600" />
          <h2 className="font-medium text-sm tracking-tight text-zinc-800 uppercase">AI Alchemy Tutor</h2>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-zinc-50/30"
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
              m.role === 'user' ? "bg-white border-zinc-200 text-zinc-400" : "bg-emerald-600 text-white border-emerald-500 shadow-sm"
            )}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
              m.role === 'user' 
                ? "bg-zinc-800 text-white rounded-tr-none" 
                : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
            )}>
              <div className="prose prose-sm max-w-none prose-p:my-0 prose-ul:my-2 prose-li:my-0 text-inherit">
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
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            </div>
            <div className="p-3 bg-white border border-zinc-100 rounded-2xl rounded-tl-none italic text-zinc-400 text-xs shadow-sm">
              Synthesizing response...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-zinc-100">
        <div className="relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about entropy, bonding, or isotopes..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-zinc-400 text-zinc-800"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-md shadow-emerald-600/10 disabled:opacity-50 disabled:grayscale transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 mt-2 text-center uppercase tracking-widest font-medium">AtomicTutor AI v1.0 • Use with Data Booklet v2025</p>
      </div>
    </div>
  );
}
