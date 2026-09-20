import React from 'react';
import {
  Bell,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Disc,
  Volume2,
  Moon,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AetherNotification, AppId, SystemSettings } from '../types';
import { soundEngine } from '../utils/audio';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AetherNotification[];
  onClearAll: () => void;
  onDismiss: (id: string) => void;
  onOpenApp: (appId: AppId) => void;
  settings: SystemSettings;
  onUpdateSettings: (patch: Partial<SystemSettings>) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onDismiss,
  onOpenApp,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <aside
        id="aether-notification-center"
        className="fixed top-9 right-2 bottom-20 w-80 sm:w-96 max-w-[calc(100vw-16px)] bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-sm text-white">Notification Center</span>
            {notifications.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px]">
                {notifications.length}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  soundEngine.playUiSound('close');
                  onClearAll();
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors text-xs flex items-center space-x-1"
                title="Clear All"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Do Not Disturb Bar */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-white/5 flex items-center justify-between text-xs">
          <span className="flex items-center space-x-1.5 text-slate-300">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Do Not Disturb</span>
          </span>
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              onUpdateSettings({ doNotDisturb: !settings.doNotDisturb });
            }}
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
              settings.doNotDisturb ? 'bg-violet-600' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.doNotDisturb ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Bell className="w-10 h-10 mb-2 opacity-30 stroke-1" />
              <div className="text-sm font-medium text-slate-400">All Quiet</div>
              <div className="text-xs mt-1 max-w-xs">
                System telemetry and spatial intelligence alerts will appear here.
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                      {renderIcon(notif.type)}
                    </div>
                    <span className="font-semibold text-xs text-white truncate max-w-[180px]">
                      {notif.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-slate-500">{notif.timestamp}</span>
                    <button
                      onClick={() => {
                        soundEngine.playUiSound('click');
                        onDismiss(notif.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed pl-1">
                  {notif.message}
                </p>

                {notif.appId && (
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => {
                        soundEngine.playUiSound('open');
                        onOpenApp(notif.appId!);
                        onClose();
                      }}
                      className="flex items-center space-x-1 text-[11px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <span>Open Application</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};
