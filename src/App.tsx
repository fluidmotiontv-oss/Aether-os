import React, { useState, useEffect, useCallback } from 'react';
import { AppId, WindowState, SystemSettings, AetherNotification, SnapTarget } from './types';
import { DEFAULT_SETTINGS, APPS_CATALOG } from './utils/storage';
import { soundEngine } from './utils/audio';

// Components
import { WallpaperCanvas } from './components/WallpaperCanvas';
import { TopBar } from './components/TopBar';
import { Dock } from './components/Dock';
import { WindowFrame } from './components/WindowFrame';
import { ControlCenter } from './components/ControlCenter';
import { CommandPalette } from './components/CommandPalette';
import { DesktopWidgets } from './components/DesktopWidgets';
import { LockScreen } from './components/LockScreen';
import { NotificationCenter } from './components/NotificationCenter';
import { ToastContainer } from './components/ToastContainer';

// Apps
import { NeuralAIApp } from './apps/NeuralAIApp';
import { TerminalApp } from './apps/TerminalApp';
import { NotesApp } from './apps/NotesApp';
import { SoundLabApp } from './apps/SoundLabApp';
import { CodeStudioApp } from './apps/CodeStudioApp';
import { FileManagerApp } from './apps/FileManagerApp';
import { SettingsApp } from './apps/SettingsApp';
import { ClockApp } from './apps/ClockApp';
import { ArcadeApp } from './apps/ArcadeApp';
import { AppHubApp } from './apps/AppHubApp';
import { CalculatorApp } from './apps/CalculatorApp';
import { WhiteboardApp } from './apps/WhiteboardApp';
import { MediaPlayerApp } from './apps/MediaPlayerApp';

export default function App() {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('aether_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [windows, setWindows] = useState<WindowState[]>(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    return [
      {
        id: 'win-neural-ai',
        appId: 'neural-ai',
        title: 'Aether Neural Core',
        icon: 'Sparkles',
        isMinimized: false,
        isMaximized: isMobile,
        zIndex: 10,
        position: { x: Math.max(10, (window.innerWidth - 780) / 2), y: Math.max(40, (window.innerHeight - 560) / 2) },
        size: { width: Math.min(window.innerWidth - 20, 780), height: Math.min(window.innerHeight - 100, 560) },
        workspaceId: 1,
      },
    ];
  });

  const [activeWindowId, setActiveWindowId] = useState<string>('win-neural-ai');
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [highestZIndex, setHighestZIndex] = useState(20);

  // Notification System State
  const [notifications, setNotifications] = useState<AetherNotification[]>([
    {
      id: 'notif-welcome',
      title: 'Aether Kernel v3.4 Initialized',
      message: 'Spatial window snapping, Synaptic Whiteboard, and Quantum Audio are online.',
      timestamp: 'Just now',
      type: 'neural',
      appId: 'neural-ai',
      read: false,
    },
    {
      id: 'notif-waves',
      title: 'Aether Waves Ready',
      message: 'Explore ambient synth frequencies and holographic visualizers in the dock.',
      timestamp: '1m ago',
      type: 'media',
      appId: 'media-player',
      read: false,
    },
  ]);
  const [activeToasts, setActiveToasts] = useState<AetherNotification[]>([]);

  const addNotification = useCallback(
    (notif: Omit<AetherNotification, 'id' | 'timestamp'>) => {
      const id = `notif-${Date.now()}`;
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fullNotif: AetherNotification = { ...notif, id, timestamp, read: false };

      setNotifications((prev) => [fullNotif, ...prev]);

      if (!settings.doNotDisturb) {
        soundEngine.playUiSound('chime');
        setActiveToasts((prev) => [fullNotif, ...prev.slice(0, 3)]);
        // Auto-dismiss toast after 5.5s
        setTimeout(() => {
          setActiveToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5500);
      }
    },
    [settings.doNotDisturb]
  );

  const dismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setActiveToasts([]);
  };

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('aether_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (patch: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  // Focus Window
  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setHighestZIndex((prev) => {
      const nextZ = prev + 1;
      setWindows((wins) =>
        wins.map((w) => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w))
      );
      return nextZ;
    });
  }, []);

  // Open App Window
  const openApp = useCallback((appId: AppId) => {
    const def = APPS_CATALOG.find((a) => a.id === appId);
    if (!def) return;

    soundEngine.playUiSound('open');

    // Check if window already exists in current workspace
    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      if (existing.workspaceId !== settings.activeWorkspace) {
        // Move to current workspace
        setWindows((wins) =>
          wins.map((w) =>
            w.id === existing.id
              ? { ...w, workspaceId: settings.activeWorkspace, isMinimized: false }
              : w
          )
        );
      }
      focusWindow(existing.id);
      return;
    }

    // Create new window with offset
    const offset = (windows.length % 6) * 30;
    const newZ = highestZIndex + 1;
    setHighestZIndex(newZ);

    const isMobile = window.innerWidth < 640;

    const newWindow: WindowState = {
      id: `win-${appId}-${Date.now()}`,
      appId,
      title: def.title,
      icon: def.iconName,
      isMinimized: false,
      isMaximized: isMobile, // Auto-maximize on mobile
      zIndex: newZ,
      position: {
        x: Math.max(40, Math.min(window.innerWidth - def.defaultSize.width - 40, 100 + offset)),
        y: Math.max(50, Math.min(window.innerHeight - def.defaultSize.height - 80, 60 + offset)),
      },
      size: { width: def.defaultSize.width, height: def.defaultSize.height },
      workspaceId: settings.activeWorkspace,
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  }, [windows, highestZIndex, settings.activeWorkspace, focusWindow]);

  // Close Window
  const closeWindow = useCallback((id: string) => {
    setWindows((wins) => wins.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      const remaining = windows.filter((w) => w.id !== id && w.workspaceId === settings.activeWorkspace);
      if (remaining.length > 0) {
        setActiveWindowId(remaining[remaining.length - 1].id);
      } else {
        setActiveWindowId('');
      }
    }
  }, [windows, activeWindowId, settings.activeWorkspace]);

  // Minimize Window
  const minimizeWindow = useCallback((id: string) => {
    setWindows((wins) =>
      wins.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  }, []);

  // Maximize / Restore Window
  const toggleMaximizeWindow = useCallback((id: string) => {
    setWindows((wins) =>
      wins.map((w) => {
        if (w.id === id) {
          if (w.isMaximized && w.prevBounds) {
            return {
              ...w,
              isMaximized: false,
              position: { x: w.prevBounds.x, y: w.prevBounds.y },
              size: { width: w.prevBounds.width, height: w.prevBounds.height },
            };
          } else {
            return {
              ...w,
              isMaximized: true,
              prevBounds: {
                x: w.position.x,
                y: w.position.y,
                width: w.size.width,
                height: w.size.height,
              },
            };
          }
        }
        return w;
      })
    );
  }, []);

  // Window Snapping / Tiling Manager
  const snapWindow = useCallback((id: string, snapTarget: SnapTarget) => {
    if (!snapTarget) return;

    const screenW = window.innerWidth;
    const topBarH = 36;
    const dockH = 80;
    const availableH = window.innerHeight - topBarH - dockH;
    const halfW = Math.floor(screenW / 2) - 8;
    const halfH = Math.floor(availableH / 2) - 4;

    setWindows((wins) =>
      wins.map((w) => {
        if (w.id !== id) return w;

        // Remember previous normal bounds for restore
        const prevBounds = w.prevBounds || {
          x: w.position.x,
          y: w.position.y,
          width: w.size.width,
          height: w.size.height,
        };

        switch (snapTarget) {
          case 'left':
            return {
              ...w,
              isMaximized: false,
              prevBounds,
              position: { x: 8, y: topBarH + 4 },
              size: { width: halfW, height: availableH },
            };
          case 'right':
            return {
              ...w,
              isMaximized: false,
              prevBounds,
              position: { x: halfW + 16, y: topBarH + 4 },
              size: { width: halfW, height: availableH },
            };
          case 'top':
            return {
              ...w,
              isMaximized: true,
              prevBounds,
            };
          case 'top-left':
            return {
              ...w,
              isMaximized: false,
              prevBounds,
              position: { x: 8, y: topBarH + 4 },
              size: { width: halfW, height: halfH },
            };
          case 'top-right':
            return {
              ...w,
              isMaximized: false,
              prevBounds,
              position: { x: halfW + 16, y: topBarH + 4 },
              size: { width: halfW, height: halfH },
            };
          case 'bottom-left':
            return {
              ...w,
              isMaximized: false,
              prevBounds,
              position: { x: 8, y: topBarH + halfH + 12 },
              size: { width: halfW, height: halfH },
            };
          case 'bottom-right':
            return {
              ...w,
              isMaximized: false,
              prevBounds,
              position: { x: halfW + 16, y: topBarH + halfH + 12 },
              size: { width: halfW, height: halfH },
            };
          default:
            return w;
        }
      })
    );
  }, []);

  // Update Window Bounds
  const updateWindowBounds = useCallback((id: string, bounds: { x: number; y: number; width: number; height: number }) => {
    setWindows((wins) =>
      wins.map((w) =>
        w.id === id
          ? {
              ...w,
              position: { x: bounds.x, y: bounds.y },
              size: { width: bounds.width, height: bounds.height },
            }
          : w
      )
    );
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K -> Spotlight
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
      // Alt + 1-4 -> Switch Workspace
      if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const ws = parseInt(e.key, 10);
        soundEngine.playUiSound('warp');
        updateSettings({ activeWorkspace: ws });
      }
      // Alt + L -> Lock
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLocked(true);
      }
      // Ctrl + Shift + N -> Notification Center
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNotificationCenterOpen((prev) => !prev);
      }
      // Ctrl + Alt + Arrow Keys -> Window Snapping
      if ((e.ctrlKey || e.metaKey) && e.altKey && activeWindowId) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          snapWindow(activeWindowId, 'left');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          snapWindow(activeWindowId, 'right');
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          snapWindow(activeWindowId, 'top');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          toggleMaximizeWindow(activeWindowId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWindowId, snapWindow, toggleMaximizeWindow]);

  // Render App Contents
  const renderAppContent = (appId: AppId) => {
    switch (appId) {
      case 'neural-ai':
        return <NeuralAIApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'notes':
        return <NotesApp />;
      case 'sound-lab':
        return <SoundLabApp />;
      case 'code-studio':
        return <CodeStudioApp />;
      case 'files':
        return <FileManagerApp />;
      case 'settings':
        return <SettingsApp settings={settings} onUpdateSettings={updateSettings} />;
      case 'clock':
        return <ClockApp />;
      case 'arcade':
        return <ArcadeApp />;
      case 'app-hub':
        return <AppHubApp onOpenApp={openApp} />;
      case 'calculator':
        return <CalculatorApp />;
      case 'whiteboard':
        return <WhiteboardApp />;
      case 'media-player':
        return <MediaPlayerApp />;
      default:
        return <div className="p-4 text-slate-300">App not found</div>;
    }
  };

  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const currentWorkspaceWindows = windows.filter(
    (w) => w.workspaceId === settings.activeWorkspace
  );

  return (
    <main
      id="aether-os-root"
      className={`relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans text-slate-100 ${
        settings.nightLight ? 'sepia-[0.25]' : ''
      }`}
    >
      {/* 1. Dynamic Atmospheric Canvas Wallpaper */}
      <WallpaperCanvas
        style={settings.wallpaper}
        speed={settings.wallpaperSpeed}
        particleDensity={settings.particleDensity}
        theme={settings.theme}
      />

      {/* 2. Top System Menu Bar */}
      <TopBar
        settings={settings}
        onUpdateSettings={updateSettings}
        onOpenApp={openApp}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onToggleControlCenter={() => setIsControlCenterOpen(!isControlCenterOpen)}
        isControlCenterOpen={isControlCenterOpen}
        onToggleNotificationCenter={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
        isNotificationCenterOpen={isNotificationCenterOpen}
        unreadNotificationsCount={notifications.length}
        activeAppTitle={activeWindow?.title || 'Aether.OS'}
        activeWorkspace={settings.activeWorkspace}
        onChangeWorkspace={(ws) => updateSettings({ activeWorkspace: ws })}
        onLockScreen={() => setIsLocked(true)}
      />

      {/* 3. Desktop Telemetry & Clock Widgets */}
      <DesktopWidgets
        visible={settings.desktopWidgets}
        onOpenApp={openApp}
      />

      {/* 4. Windows Area */}
      <div id="aether-window-manager" className="fixed inset-0 top-9 pointer-events-none">
        {currentWorkspaceWindows.map((win) => {
          const isActive = win.id === activeWindowId;
          return (
            <div key={win.id} className="pointer-events-auto">
              <WindowFrame
                window={win}
                isActive={isActive}
                onFocus={() => focusWindow(win.id)}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onMaximize={() => toggleMaximizeWindow(win.id)}
                onSnap={(snapTarget) => snapWindow(win.id, snapTarget)}
                onUpdateBounds={(bounds) => updateWindowBounds(win.id, bounds)}
              >
                {renderAppContent(win.appId)}
              </WindowFrame>
            </div>
          );
        })}
      </div>

      {/* 5. Floating Glass Dock */}
      <Dock
        openWindows={currentWorkspaceWindows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        onRestoreWindow={focusWindow}
        isMagnified={settings.dockMagnification}
      />

      {/* 6. Control Center Flyout */}
      <ControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      {/* 7. Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onClearAll={clearAllNotifications}
        onDismiss={dismissNotification}
        onOpenApp={openApp}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      {/* 8. Floating Toast Notifications */}
      <ToastContainer
        toasts={activeToasts}
        onDismiss={dismissToast}
        onOpenApp={openApp}
      />

      {/* 9. Omni Spotlight / Command Palette */}
      <CommandPalette
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onOpenApp={openApp}
      />

      {/* 10. Lock Screen / Screensaver */}
      <LockScreen
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        userName={settings.userName}
      />
    </main>
  );
}

