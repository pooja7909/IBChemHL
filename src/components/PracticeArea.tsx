import { useState, useEffect, useRef } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, HelpCircle, Loader2, Sparkles, RefreshCw, Atom } from 'lucide-react';
import { markAnswer, generateQuestion } from '../services/geminiService';
import { cn } from '../lib/utils';
import { IB_CURRICULUM } from '../constants/curriculum';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface PracticeAreaProps {
  initialTopicId?: string | null;
}

export default function PracticeArea({ initialTopicId }: PracticeAreaProps) {
  const [activeTab, setActiveTab] = useState<'questions' | 'results'>('questions');
  const [selectedTopic, setSelectedTopic] = useState(() => {
    if (initialTopicId) {
      const topic = IB_CURRICULUM.find(t => t.id === initialTopicId);
      return topic ? topic.code : 'mixed';
    }
    return 'mixed';
  });
  const [paperStyle, setPaperStyle] = useState<'Paper 1' | 'Paper 2'>('Paper 2');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [isMarking, setIsMarking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const hasLoadedInitial = useRef(false);

  useEffect(() => {
    if (initialTopicId && !hasLoadedInitial.current) {
      const topic = IB_CURRICULUM.find(t => t.id === initialTopicId);
      if (topic) {
        hasLoadedInitial.current = true;
        handleGenerate(topic.code);
      }
    } else if (!initialTopicId && !hasLoadedInitial.current && !currentQuestion) {
      // Load a random or first topic question if no initial ID
      hasLoadedInitial.current = true;
      handleGenerate('mixed');
    }
  }, [initialTopicId]);

  const handleGenerate = async (topicCode: string, forceStyle?: 'Paper 1' | 'Paper 2') => {
    setIsGenerating(true);
    let targetTopic = topicCode;
    const targetStyle = forceStyle || paperStyle;
    
    if (topicCode === 'mixed') {
      const randomIndex = Math.floor(Math.random() * IB_CURRICULUM.length);
      targetTopic = IB_CURRICULUM[randomIndex].code;
    }

    try {
      const q = await generateQuestion(targetTopic, targetStyle);
      setCurrentQuestion({ ...q, type: targetStyle });
      setAnswer('');
      setFeedback(null);
      setActiveTab('questions');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = async (option: string) => {
    if (isMarking) return;
    setAnswer(option);
    setIsMarking(true);
    
    try {
      const result = await markAnswer(currentQuestion.question, option);
      setFeedback(result);
      setActiveTab('results');
      if (result.level >= 6) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#ffffff']
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsMarking(false);
    }
  };

  const handleMark = async () => {
    if (!answer.trim() || isMarking) return;
    setIsMarking(true);
    try {
      const result = await markAnswer(currentQuestion.question, answer);
      setFeedback(result);
      setActiveTab('results');
      if (result.level >= 6) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#ffffff']
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="flex flex-col h-full alchemy-glass rounded-xl overflow-hidden shadow-xl shadow-zinc-200/50">
      <div className="p-4 border-b border-zinc-100 bg-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="font-medium text-sm tracking-tight text-zinc-800 uppercase">Exam Simulator</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 p-1 rounded-lg mr-2">
            {(['Paper 1', 'Paper 2'] as const).map(s => (
              <button
                key={s}
                onClick={() => {
                  setPaperStyle(s);
                  handleGenerate(selectedTopic, s);
                }}
                className={cn(
                  "px-3 py-1 rounded text-[9px] font-bold uppercase transition-all",
                  paperStyle === s ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <select 
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              handleGenerate(e.target.value);
            }}
            className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="mixed">Mixed Review</option>
            {IB_CURRICULUM.map(t => (
              <option key={t.id} value={t.code}>{t.code}</option>
            ))}
          </select>
          <button 
            onClick={() => handleGenerate(selectedTopic)}
            disabled={isGenerating}
            className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500 disabled:opacity-50"
            title="Generate New Question"
          >
            <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/20">
        {!currentQuestion && !isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-black">Initializing Simulator...</p>
          </div>
        ) : activeTab === 'questions' ? (
          <div className="space-y-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs text-zinc-600 uppercase tracking-[0.2em] font-black animate-pulse">De-coding Syllabus...</p>
              </div>
            ) : (
              <>
                <div className="p-6 bg-white border border-zinc-200 rounded-xl relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Atom className="w-12 h-12 text-emerald-600" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-3 block">
                    {currentQuestion.topic} • {currentQuestion.marks} Marks • {currentQuestion.type || 'HL'}
                  </span>
                  <div className="prose prose-sm max-w-none text-lg leading-relaxed text-zinc-900 font-bold">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {currentQuestion.question}
                    </ReactMarkdown>
                  </div>
                </div>

                {currentQuestion.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isMarking}
                        className={cn(
                          "p-4 border border-zinc-200 rounded-xl text-left text-sm transition-all hover:border-emerald-500 hover:bg-emerald-50/50 flex group",
                          isMarking && "opacity-50"
                        )}
                      >
                        <span className="w-6 h-6 rounded bg-zinc-100 border border-zinc-300 flex items-center justify-center mr-3 shrink-0 text-[10px] font-black text-zinc-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-colors">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-zinc-900 font-medium group-hover:text-emerald-800">{option}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em]">Response Manuscript</label>
                      </div>
                      <textarea 
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Provide your technical explanation including state symbols..."
                        className="w-full bg-white border border-zinc-200 rounded-2xl p-6 text-sm font-mono text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-h-[200px] transition-all resize-none shadow-sm placeholder:text-zinc-300"
                      />
                    </div>

                    <button 
                      onClick={handleMark}
                      disabled={isMarking || !answer.trim()}
                      className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-600/10 group"
                    >
                      {isMarking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          VERIFYING MARK SCHEME...
                        </>
                      ) : (
                        <>
                          TRANSMIT FOR MARKING
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-700" />
                      <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">PRECISION SCORE</p>
                      <p className="text-4xl font-mono font-black text-emerald-700 tracking-tighter">{feedback?.score} <span className="text-zinc-400 text-xl">/ {feedback?.totalMarks}</span></p>
                    </div>
                    <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl text-center relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-700" />
                      <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">IB TRANSITION</p>
                      <div className="flex items-center justify-center gap-2">
                         <p className="text-4xl font-mono font-black text-indigo-700">0{feedback?.level}</p>
                         <Sparkles className="w-5 h-5 text-indigo-700" />
                      </div>
                    </div>

            <div className="space-y-6">
               <div className="p-6 bg-white border border-zinc-100 rounded-2xl space-y-4 shadow-sm border-l-4 border-l-emerald-500">
                 <h3 className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-black flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                   Analytical Report
                 </h3>
                 <div className="text-sm text-zinc-600 leading-relaxed max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {feedback?.feedback}
                    </ReactMarkdown>
                 </div>
               </div>

               {feedback?.score < feedback?.totalMarks && feedback?.remediation && (
                 <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl space-y-4 shadow-sm border-l-4 border-l-amber-500">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-amber-600 font-black flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Remediation Detail
                    </h3>
                    <div className="text-sm text-zinc-700 leading-relaxed">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {feedback?.remediation}
                      </ReactMarkdown>
                    </div>
                 </div>
               )}
               
               <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl border-dashed">
                 <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-3">Model Solution Repository</h3>
                 <div className="text-xs text-zinc-500 font-mono leading-relaxed">
                   <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {feedback?.correctAnswer}
                   </ReactMarkdown>
                 </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setActiveTab('questions')}
                className="flex-1 py-4 border border-zinc-200 rounded-xl text-[10px] font-black hover:bg-zinc-50 transition-all uppercase tracking-[0.3em] text-zinc-400"
              >
                Retry Logic
              </button>
              <button 
                onClick={() => handleGenerate(selectedTopic)}
                className="flex-1 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-black hover:bg-emerald-100 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-2"
              >
                Reinforce Mastery
                <RefreshCw className="w-3 h-3" />
              </button>
              <button 
                onClick={() => handleGenerate(selectedTopic)}
                className="flex-[1.5] py-4 bg-zinc-900 text-white rounded-xl text-[10px] font-black hover:bg-black transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10"
              >
                Next IB Challenge
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
