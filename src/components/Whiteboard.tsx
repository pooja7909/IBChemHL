import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Pencil, RotateCcw, Download, Trash2, Undo2, Redo2, Save, FileUp } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#22c55e');
  const [brushSize, setBrushSize] = useState(3);
  const [mode, setMode] = useState<'pencil' | 'eraser'>('pencil');
  
  // History for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    // Limit history size to 20 to avoid memory issues
    if (newHistory.length > 20) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const { width, height } = parent.getBoundingClientRect();
      
      // Save current content before resize
      const tempImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Restore content after resize
      ctx.putImageData(tempImageData, 0, 0);
      
      // Initial history point if empty
      if (history.length === 0) {
        saveToHistory();
      }
    };

    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (('clientX' in e ? e.clientX : e.touches[0].clientX)) - rect.left;
    const y = (('clientY' in e ? e.clientY : e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = mode === 'eraser' ? brushSize * 10 : brushSize;
    ctx.strokeStyle = mode === 'eraser' ? '#111114' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.putImageData(history[newIndex], 0, 0);
        setHistoryIndex(newIndex);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.putImageData(history[newIndex], 0, 0);
        setHistoryIndex(newIndex);
      }
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  };

  const saveToStore = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      localStorage.setItem('atomic_tutor_whiteboard', dataUrl);
      alert('Drawing saved to local storage!');
    }
  };

  const loadFromStore = () => {
    const dataUrl = localStorage.getItem('atomic_tutor_whiteboard');
    if (!dataUrl) {
      alert('No saved drawing found.');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw image scaled to current canvas dimensions for better consistency
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = dataUrl;
    }
  };

  return (
    <div className="flex flex-col h-full alchemy-glass rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/5">
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button 
              onClick={() => setMode('pencil')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                mode === 'pencil' ? "bg-emerald-500 text-emerald-950" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="Pencil"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMode('eraser')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                mode === 'eraser' ? "bg-emerald-500 text-emerald-950" : "text-zinc-500 hover:text-zinc-300"
              )}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
          
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:hover:text-zinc-500"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:hover:text-zinc-500"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            {['#22c55e', '#ef4444', '#3b82f6', '#fafafa'].map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setMode('pencil'); }}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                  color === c && mode === 'pencil' ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4 font-mono text-[10px] font-bold uppercase tracking-wider">
          <button 
            onClick={saveToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button 
            onClick={loadFromStore}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-all"
          >
            <FileUp className="w-3.5 h-3.5" />
            Load
          </button>
          <div className="h-6 w-px bg-zinc-800" />
          <button onClick={clear} className="flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#111114] relative cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="absolute inset-0"
        />
        <div className="absolute bottom-4 left-4 p-2 bg-zinc-950/80 rounded-lg border border-zinc-800/50 backdrop-blur pointer-events-none">
          <p className="text-[10px] text-emerald-500/50 uppercase font-bold tracking-tighter">Drafting Zone • Revision {historyIndex + 1}</p>
        </div>
      </div>
    </div>
  );
}
