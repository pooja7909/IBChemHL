import { useState } from 'react';
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

export default function PracticeArea() {
  const [activeTab, setActiveTab] = useState<'questions' | 'results'>('questions');
  const [selectedTopic, setSelectedTopic] = useState('mixed');
  const [currentQuestion, setCurrentQuestion] = useState<any>({
    topic: "Structure 1.2",
    question: "A beam of particles consisting of protons, neutrons, and electrons is passed through an electric field between a positive and negative electrode. Identify which particle follows path X (deflected towards the positive electrode) and why.",
    marks: 2,
    difficulty: "Medium"
  });
  const [answer, setAnswer] = useState('');
  const [isMarking, setIsMarking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleGenerate = async (topicCode: string) => {
    setIsGenerating(true);
    let targetTopic = topicCode;
    
    // If mixed, pick a random topic from curriculum
    if (topicCode === 'mixed') {
      const randomIndex = Math.floor(Math.random() * IB_CURRICULUM.length);
      targetTopic = IB_CURRICULUM[randomIndex].code;
    }

    try {
      const q = await generateQuestion(targetTopic);
      setCurrentQuestion(q);
      setAnswer('');
      setFeedback(null);
      setActiveTab('questions');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
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
    <div className="flex flex-col h-full alchemy-glass rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/5">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="font-medium text-sm tracking-tight text-zinc-100 uppercase">Unlimited Exam Simulator</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              handleGenerate(e.target.value);
            }}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="mixed">Mixed Review (Random)</option>
            {IB_CURRICULUM.map(t => (
              <option key={t.id} value={t.code}>{t.code}</option>
            ))}
          </select>
          <button 
            onClick={() => handleGenerate(selectedTopic)}
            disabled={isGenerating}
            className="p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors text-zinc-300 disabled:opacity-50"
            title="Generate New Question"
          >
            <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'questions' ? (
          <div className="space-y-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black animate-pulse">Scanning Past Papers...</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Atom className="w-12 h-12 text-emerald-500" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-black mb-3 block">{currentQuestion.topic} • {currentQuestion.marks} Marks • {currentQuestion.difficulty || 'HL'}</span>
                  <p className="text-lg leading-relaxed text-zinc-100 font-medium">{currentQuestion.question}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Response Manuscript</label>
                    <span className="text-[9px] font-mono text-zinc-600 uppercase">Auto-sync active</span>
                  </div>
                  <textarea 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Provide your technical explanation including state symbols and chemical equations where necessary..."
                    className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 text-sm font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-h-[200px] transition-all resize-none shadow-inner"
                  />
                </div>

                <button 
                  onClick={handleMark}
                  disabled={isMarking || !answer.trim()}
                  className="w-full py-5 bg-emerald-500 text-emerald-950 font-black rounded-2xl hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/10 group active:scale-[0.98]"
                >
                  {isMarking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      CALIBRATING FEEDBACK LOOP...
                    </>
                  ) : (
                    <>
                      TRANSMIT FOR AI EVALUATION
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Results stats - kept as before but styled more scientificly */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">PRECISION SCORE</p>
                <p className="text-4xl font-mono font-black text-emerald-500 tracking-tighter">{feedback?.score} <span className="text-zinc-600 text-xl">/ {feedback?.totalMarks}</span></p>
              </div>
              <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">IB PERFORMANCE LVL</p>
                <div className="flex items-center justify-center gap-2">
                   <p className="text-4xl font-mono font-black text-indigo-400">0{feedback?.level}</p>
                   <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
                 <h3 className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   Analytical Report
                 </h3>
                 <div className="text-sm text-zinc-300 leading-relaxed max-w-none">
                   <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />,
                      li: ({node, ...props}) => <li className="text-zinc-400" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-emerald-400 font-bold" {...props} />
                    }}
                   >
                    {feedback?.feedback}
                   </ReactMarkdown>
                 </div>
               </div>
               
               <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl border-dashed">
                 <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black mb-3">Model Repository Solution</h3>
                 <p className="text-xs text-zinc-500 font-mono leading-relaxed">{feedback?.correctAnswer}</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setActiveTab('questions')}
                className="flex-1 py-4 border border-zinc-800 rounded-xl text-[10px] font-black hover:bg-zinc-900 transition-all uppercase tracking-[0.3em] text-zinc-400"
              >
                Refine Hypothesis
              </button>
              <button 
                onClick={() => handleGenerate(selectedTopic)}
                className="flex-[2] py-4 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-black hover:bg-white transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-2 shadow-xl shadow-white/5"
              >
                Next Field Experiment
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
