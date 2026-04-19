import { motion } from 'motion/react';
import { CalendarDays, Clock, Target, CheckCircle2, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { STUDY_ROADMAP, IB_CURRICULUM } from '../constants/curriculum';
import { cn } from '../lib/utils';
import { format, addWeeks } from 'date-fns';

export default function Dashboard() {
  const EXAM_DATE = new Date('2026-05-16');
  const today = new Date();
  
  return (
    <div className="space-y-8 p-1">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="alchemy-glass p-6 rounded-2xl border-l-4 border-l-emerald-500 overflow-hidden relative group"
        >
          <Zap className="absolute -right-4 -top-4 w-24 h-24 text-emerald-500/5 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Countdown</span>
          </div>
          <p className="text-3xl font-mono font-bold tracking-tighter">4 WEEKS</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-medium tracking-tight italic">Until Paper 1A & 1B</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="alchemy-glass p-6 rounded-2xl border-l-4 border-l-indigo-500 overflow-hidden relative group"
        >
          <Target className="absolute -right-4 -top-4 w-24 h-24 text-indigo-500/5 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">Current Goal</span>
          </div>
          <p className="text-xl font-medium tracking-tight">Reactivity 1.4</p>
          <p className="text-xs text-zinc-500 mt-1 font-mono uppercase">Entropy & Spontaneity</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="alchemy-glass p-6 rounded-2xl border-l-4 border-l-amber-500 overflow-hidden relative group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <CalendarDays className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.2em]">Assessment</span>
          </div>
          <p className="text-xl font-medium tracking-tight">{format(EXAM_DATE, 'MMMM dd, yyyy')}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-medium tracking-tighter italic font-mono">IBDP Chemistry HL Global Exam</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Roadmap */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">Weekly Mastery Roadmap</h3>
            <span className="text-[10px] font-mono text-zinc-600 uppercase">April - May 2026</span>
          </div>
          
          <div className="space-y-4">
            {STUDY_ROADMAP.map((phase) => {
              const isActive = phase.week === 1; // Simulation: Week 1 is active
              return (
                <div 
                  key={phase.week}
                  className={cn(
                    "relative pl-8 pb-4 group",
                    phase.week !== STUDY_ROADMAP.length && "after:absolute after:left-3 after:top-8 after:bottom-0 after:w-px after:bg-zinc-800"
                  )}
                >
                  <div className={cn(
                    "absolute left-0 top-1 w-6 h-6 rounded-md flex items-center justify-center border transition-all z-10",
                    isActive ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-zinc-900 border-zinc-700 text-zinc-600"
                  )}>
                    {isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-950" /> : <span className="text-[10px] font-bold">{phase.week}</span>}
                  </div>
                  
                  <div className={cn(
                    "p-5 rounded-2xl border transition-all duration-300",
                    isActive ? "bg-emerald-500/5 border-emerald-500/20 scale-[1.02]" : "bg-zinc-900/30 border-zinc-800/10 opacity-70 hover:opacity-100"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-zinc-100 uppercase tracking-wide">{phase.focus}</h4>
                      <span className="text-[9px] font-black bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase">Week {phase.week}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">{phase.objective}</p>
                    {isActive && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[65%] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">65% DONE</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reminders & Topics */}
        <section className="space-y-6">
          <div className="p-6 alchemy-glass rounded-3xl border-t-2 border-t-emerald-500 relative overflow-hidden">
            <Sparkles className="absolute right-4 top-4 w-12 h-12 text-zinc-800 transform rotate-12" />
            <h3 className="text-xl font-bold tracking-tight mb-2">Morning Reflection</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 italic">
              "To explain the high boiling point of water, don't just say 'Hydrogen Bonding'. You must specify it's an 
              intermolecular force between the lone pair on the Oxygen atom of one molecule and the partially positive 
              Hydrogen of another."
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-500/5 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
              Exam Tip #42
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 px-2">Core HL Inventory</h3>
             <div className="grid grid-cols-1 gap-2">
               {IB_CURRICULUM.map(topic => (
                 <div key={topic.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-mono text-xs font-bold text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-200 transition-colors">
                        {topic.id.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{topic.code}</p>
                        <p className="text-[10px] text-zinc-500 italic mt-0.5">{topic.subtopics.length} Master Classes Ready</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
                 </div>
               ))}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
