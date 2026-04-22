import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Target, CheckCircle2, ChevronRight, Zap, Sparkles, BookOpen, MessageSquare, ListTodo } from 'lucide-react';
import { STUDY_ROADMAP, IB_CURRICULUM } from '../constants/curriculum';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { progressService, TopicProgress } from '../services/progressService';

interface DashboardProps {
  onNavigate: (view: 'chat' | 'practice', topicId?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const EXAM_DATE = new Date('2026-05-16');
  const [progress, setProgress] = useState<Record<string, TopicProgress>>(progressService.getProgress());

  useEffect(() => {
    const handleStorage = () => {
      setProgress(progressService.getProgress());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const calculateOverallProgress = () => {
    const completed = Object.values(progress).filter(p => p.status === 'completed').length;
    const total = IB_CURRICULUM.length;
    return Math.round((completed / total) * 100);
  };

  const currentProgress = calculateOverallProgress();

  const handleStatusChange = (topicId: string, status: TopicProgress['status']) => {
    progressService.updateTopicStatus(topicId, status);
    setProgress(progressService.getProgress());
  };

  return (
    <div className="space-y-8 p-1">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alchemy-glass p-6 rounded-2xl border-l-4 border-l-emerald-500 overflow-hidden relative group shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em]">Mastery Score</span>
          </div>
          <p className="text-3xl font-mono font-black tracking-tighter">{currentProgress}%</p>
          <div className="mt-4 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <p className="text-xs text-zinc-400 mt-2 uppercase font-medium tracking-tight italic">Global Syllabus Progress</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="alchemy-glass p-6 rounded-2xl border-l-4 border-l-indigo-600 overflow-hidden relative group shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.2em]">Target Mastery</span>
          </div>
          <p className="text-3xl font-mono font-black tracking-tighter">EXPERT</p>
          <p className="text-xs text-zinc-400 mt-1 font-mono uppercase italic">IB Chemistry HL Student</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="alchemy-glass p-6 rounded-2xl border-l-4 border-l-amber-600 overflow-hidden relative group shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <CalendarDays className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-[0.2em]">Assessment</span>
          </div>
          <p className="text-xl font-medium tracking-tight text-zinc-800">{format(EXAM_DATE, 'MMMM dd, yyyy')}</p>
          <p className="text-xs text-zinc-400 mt-1 uppercase font-medium tracking-tighter italic font-mono uppercase">Paper 1A & 1B (24 Days Left)</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Roadmap */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              Dynamic Study Roadmap
            </h3>
          </div>
          
          <div className="space-y-4">
            {STUDY_ROADMAP.map((phase) => {
              const topicProgress = progress[phase.topicId] || { status: 'not_started' };
              const isFinished = topicProgress.status === 'completed';
              
              return (
                <div 
                  key={phase.week}
                  className={cn(
                    "relative pl-8 pb-4 group",
                    phase.week !== STUDY_ROADMAP.length && "after:absolute after:left-3 after:top-8 after:bottom-0 after:w-px after:bg-zinc-100"
                  )}
                >
                  <button 
                    onClick={() => handleStatusChange(phase.topicId, isFinished ? 'not_started' : 'completed')}
                    className={cn(
                      "absolute left-0 top-1 w-6 h-6 rounded-md flex items-center justify-center border transition-all z-10",
                      isFinished ? "bg-emerald-600 border-emerald-500 shadow-md shadow-emerald-500/20 text-white" : "bg-white border-zinc-200 text-zinc-400 hover:border-emerald-500"
                    )}
                  >
                    {isFinished ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{phase.week}</span>}
                  </button>
                  
                  <div className={cn(
                    "p-5 rounded-2xl border transition-all duration-300",
                    isFinished ? "bg-white border-zinc-100 opacity-60" : "bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-md"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-zinc-800 uppercase tracking-wide">{phase.focus}</h4>
                      <span className="text-[8px] font-black bg-zinc-50 text-zinc-400 border border-zinc-100 px-2 py-0.5 rounded uppercase font-mono">Week {phase.week}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed italic mb-4">{phase.objective}</p>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onNavigate('chat', phase.topicId)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Revise
                      </button>
                      <button 
                        onClick={() => onNavigate('practice', phase.topicId)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        Practice
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reminders & Inventory */}
        <section className="space-y-6">
          <div className="p-6 alchemy-glass rounded-3xl border-t-2 border-t-emerald-600 relative overflow-hidden shadow-sm shadow-emerald-600/5">
            <Sparkles className="absolute right-4 top-4 w-12 h-12 text-emerald-600/5 transform rotate-12" />
            <h3 className="text-xl font-bold tracking-tight mb-2 text-zinc-800">Mastery Reflection</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6 italic">
              "To explain high boiling points, always identify the specific INTERMOLECULAR forces. Don't just say 'bonds'. Specify dipole-dipole, London forces, or Hydrogen bonding."
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
              IB Examiner Advice #104
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Content Completion</h3>
               <span className="text-[10px] font-mono text-zinc-400">TRACK BY UNIT</span>
             </div>
             
             <div className="grid grid-cols-1 gap-2">
               {IB_CURRICULUM.map(topic => {
                 const topicProgress = progress[topic.id] || { status: 'not_started' };
                 const isCompleted = topicProgress.status === 'completed';
                 
                 return (
                   <div key={topic.id} className={cn(
                     "p-4 bg-white border rounded-xl flex items-center justify-between group transition-all shadow-sm",
                     isCompleted ? "border-emerald-100 bg-emerald-50/10" : "border-zinc-100 hover:border-zinc-200"
                   )}>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleStatusChange(topic.id, isCompleted ? 'not_started' : 'completed')}
                          className={cn(
                            "w-10 h-10 border rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all",
                            isCompleted ? "bg-emerald-600 border-emerald-500 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-400 group-hover:bg-zinc-100"
                          )}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : topic.code.split(' ')[1]}
                        </button>
                        <div>
                          <p className="text-xs font-bold text-zinc-700 uppercase tracking-tight">{topic.code}</p>
                          <p className={cn(
                            "text-[10px] mt-0.5 uppercase tracking-tighter font-bold",
                            isCompleted ? "text-emerald-600" : "text-zinc-400"
                          )}>
                            {isCompleted ? "Unit Mastered" : "Revision Required"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onNavigate('chat', topic.id)}
                          className="p-2 text-zinc-300 hover:text-emerald-600 transition-colors"
                          title="Revise Topic with AI"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onNavigate('practice', topic.id)}
                          className="p-2 text-zinc-300 hover:text-indigo-600 transition-colors"
                          title="Practice Topic"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                 );
               })}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
