export type AppId = 
  | 'neural-ai' 
  | 'terminal' 
  | 'notes' 
  | 'sound-lab' 
  | 'code-studio' 
  | 'files' 
  | 'settings' 
  | 'clock' 
  | 'arcade' 
  | 'app-hub'
  | 'calculator'
  | 'whiteboard'
  | 'media-player';

export type WallpaperStyle = 'aurora' | 'nebula' | 'cyber-grid' | 'solar-flare' | 'void-ethereal';
export type ThemeColor = 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'monochrome';

export type SnapTarget = 'left' | 'right' | 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | null;

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  workspaceId: number;
  prevBounds?: { x: number; y: number; width: number; height: number };
}

export interface AppDefinition {
  id: AppId;
  title: string;
  iconName: string;
  category: 'AI & Core' | 'Development' | 'Creativity' | 'System' | 'Utilities';
  description: string;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  pinnedToDock?: boolean;
  addedDate?: string;
  defaultUsage?: number;
}

export interface AetherNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'neural' | 'media';
  appId?: AppId;
  icon?: string;
  read?: boolean;
}

export interface SystemSettings {
  wallpaper: WallpaperStyle;
  wallpaperSpeed: number;
  particleDensity: number;
  theme: ThemeColor;
  glassBlur: number;
  soundEffects: boolean;
  soundVolume: number;
  dockMagnification: boolean;
  activeWorkspace: number;
  nightLight: boolean;
  desktopWidgets: boolean;
  userName: string;
  doNotDisturb: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  isPinned: boolean;
  updatedAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'text' | 'image' | 'audio' | 'code';
  size?: string;
  path: string;
  content?: string;
  updatedAt: string;
  children?: FileItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: string;
}

export interface SoundTrack {
  id: string;
  name: string;
  type: 'drone' | 'rain' | 'pulsar' | 'binaural' | 'wind';
  volume: number;
  isPlaying: boolean;
}
