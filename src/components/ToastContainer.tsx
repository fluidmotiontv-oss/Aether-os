import React from 'react';
import { AetherNotification, AppId } from '../types';
import { X, Sparkles, CheckCircle2, AlertTriangle, Info, Disc } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ToastContainerProps {
  toasts: AetherNotification[];
  onDismiss: (id: string) => void;
  onOpenApp: (appId: AppId) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onOpenApp,
}) => {
  if (toasts.length === 0) return null;

  const renderIcon = (type: AetherNotification['type']) => {
    switch (type) {
      case 'neural':
        return <Sparkles className="w-4 h-4 text-violet-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'media':
        return <Disc className="w-4 h-4 text-cyan-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div
      id="aether-toast-container"
      className="fixed top-12 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-3.5 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex items-start justify-between space-x-3 animate-in slide-in-from-top-4 fade-in duration-200 transition-all hover:scale-[1.02]"
        >
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
            {renderIcon(toast.type)}
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              if (toast.appId) {
                soundEngine.playUiSound('open');
                onOpenApp(toast.appId);
                onDismiss(toast.id);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white truncate">{toast.title}</span>
              <span className="text-[10px] font-mono text-slate-500">{toast.timestamp}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              onDismiss(toast.id);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
