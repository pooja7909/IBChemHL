import { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  PenTool, 
  BookOpen, 
  Atom, 
  Beaker,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import TutorChat from './components/TutorChat';
import Whiteboard from './components/Whiteboard';
import PracticeArea from './components/PracticeArea';

type View = 'dashboard' | 'chat' | 'whiteboard' | 'practice';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Roadmap' },
    { id: 'chat', icon: MessageSquare, label: 'AI Tutor' },
    { id: 'practice', icon: BookOpen, label: 'Simulator' },
    { id: 'whiteboard', icon: PenTool, label: 'Workbench' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'chat': return <TutorChat />;
      case 'whiteboard': return <Whiteboard />;
      case 'practice': return <PracticeArea />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden scientific-grid">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-zinc-800 flex flex-col bg-[#09090b]">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Atom className="w-6 h-6 text-emerald-950 animate-pulse" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Atomic<span className="text-emerald-500">Tutor</span></h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">IB Chemistry HL</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative",
                currentView === item.id 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", currentView === item.id ? "text-emerald-400" : "group-hover:text-zinc-300")} />
              <span className="hidden md:block font-bold text-xs uppercase tracking-widest">{item.label}</span>
              {currentView === item.id && <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-full" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-4">
           <div className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 font-bold text-xs ring-2 ring-indigo-500/20">PH</div>
              <div className="hidden md:block flex-1 min-w-0">
                <p className="text-xs font-bold truncate">IBDP Chem HL</p>
                <p className="text-[10px] text-zinc-500 truncate">Candidate Exam in May 2027</p>
              </div>
           </div>
           <button className="w-full flex items-center gap-4 px-4 py-2 text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest text-[10px] font-bold">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:block">Terminate Session</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-50">
           <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Current Node:</span>
              <span className="text-xs font-mono text-emerald-500 font-bold ">~/ROOT/HL_STUDY/STRUCTURE_REACTIVITY</span>
           </div>
           <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">Sync: 18:14:02 UTC</span>
              </div>
              <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-900" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
           </div>
        </header>

        {/* Dynamic Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </div>

        {/* Floating Beaker decoration */}
        <div className="fixed bottom-8 right-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
           <Beaker className="w-32 h-32 text-emerald-500" />
        </div>
      </main>
    </div>
  );
}
