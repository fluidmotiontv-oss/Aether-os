import { FileItem, NoteItem, SystemSettings, AppDefinition } from '../types';

export const DEFAULT_SETTINGS: SystemSettings = {
  wallpaper: 'aurora',
  wallpaperSpeed: 1,
  particleDensity: 65,
  theme: 'violet',
  glassBlur: 16,
  soundEffects: true,
  soundVolume: 0.6,
  dockMagnification: true,
  activeWorkspace: 1,
  nightLight: false,
  desktopWidgets: true,
  userName: 'Aether Explorer',
  doNotDisturb: false,
};

export const APPS_CATALOG: AppDefinition[] = [
  {
    id: 'neural-ai',
    title: 'Aether Neural Core',
    iconName: 'Sparkles',
    category: 'AI & Core',
    description: 'Holographic conversational intelligence with multi-modal neural simulation.',
    defaultSize: { width: 780, height: 600 },
    minSize: { width: 480, height: 420 },
    pinnedToDock: true,
    addedDate: '2026-08-10',
    defaultUsage: 142,
  },
  {
    id: 'calculator',
    title: 'Quantum Calculator',
    iconName: 'Calculator',
    category: 'Utilities',
    description: 'Scientific calculator, quantum constants, function plotting, and cosmic unit converter.',
    defaultSize: { width: 680, height: 580 },
    minSize: { width: 460, height: 460 },
    pinnedToDock: true,
    addedDate: '2026-08-13',
    defaultUsage: 115,
  },
  {
    id: 'whiteboard',
    title: 'Synaptic Board',
    iconName: 'PenTool',
    category: 'Creativity',
    description: 'Infinite spatial canvas with neon ink, sticky thought nodes, and architecture diagrams.',
    defaultSize: { width: 880, height: 600 },
    minSize: { width: 560, height: 420 },
    pinnedToDock: true,
    addedDate: '2026-08-13',
    defaultUsage: 88,
  },
  {
    id: 'media-player',
    title: 'Aether Waves',
    iconName: 'Disc',
    category: 'Creativity',
    description: 'Audio player with 3D audio reactive spectrum visualizers, lo-fi streams, and local track support.',
    defaultSize: { width: 800, height: 560 },
    minSize: { width: 520, height: 420 },
    pinnedToDock: true,
    addedDate: '2026-08-13',
    defaultUsage: 104,
  },
  {
    id: 'terminal',
    title: 'Quantum Shell',
    iconName: 'Terminal',
    category: 'Development',
    description: 'Interactive system CLI with AI prompts, neofetch, system diagnostics & matrix mode.',
    defaultSize: { width: 740, height: 480 },
    minSize: { width: 500, height: 320 },
    pinnedToDock: true,
    addedDate: '2026-08-01',
    defaultUsage: 98,
  },
  {
    id: 'notes',
    title: 'Synaptic Notes',
    iconName: 'BookOpen',
    category: 'Creativity',
    description: 'Markdown knowledge base with interactive synaptic thought graph.',
    defaultSize: { width: 840, height: 560 },
    minSize: { width: 560, height: 400 },
    pinnedToDock: true,
    addedDate: '2026-08-05',
    defaultUsage: 76,
  },
  {
    id: 'sound-lab',
    title: 'Nebula Sound Lab',
    iconName: 'Radio',
    category: 'Creativity',
    description: 'Procedural ambient soundscape generator and 8-step polyphonic synthesizer.',
    defaultSize: { width: 720, height: 520 },
    minSize: { width: 480, height: 400 },
    pinnedToDock: true,
    addedDate: '2026-08-08',
    defaultUsage: 89,
  },
  {
    id: 'code-studio',
    title: 'Cosmic Code Studio',
    iconName: 'Code2',
    category: 'Development',
    description: 'Live HTML/Canvas/Shader visual development sandbox with AI auto-generation.',
    defaultSize: { width: 880, height: 620 },
    minSize: { width: 600, height: 450 },
    pinnedToDock: true,
    addedDate: '2026-08-11',
    defaultUsage: 64,
  },
  {
    id: 'files',
    title: 'Aether Vault',
    iconName: 'FolderKanban',
    category: 'System',
    description: 'Spatial virtual filesystem with instant previewer and file creator.',
    defaultSize: { width: 760, height: 500 },
    minSize: { width: 520, height: 360 },
    pinnedToDock: true,
    addedDate: '2026-07-28',
    defaultUsage: 53,
  },
  {
    id: 'clock',
    title: 'Chronos Clock',
    iconName: 'Clock',
    category: 'Utilities',
    description: 'Planetary celestial clock, world timezones, and circadian focus timer.',
    defaultSize: { width: 680, height: 480 },
    minSize: { width: 460, height: 380 },
    pinnedToDock: true,
    addedDate: '2026-08-03',
    defaultUsage: 45,
  },
  {
    id: 'arcade',
    title: 'Quantum Arcade',
    iconName: 'Gamepad2',
    category: 'Creativity',
    description: 'High-speed celestial Asteroid Defender arcade game.',
    defaultSize: { width: 660, height: 540 },
    minSize: { width: 500, height: 450 },
    pinnedToDock: false,
    addedDate: '2026-08-13',
    defaultUsage: 110,
  },
  {
    id: 'settings',
    title: 'Atmosphere & Settings',
    iconName: 'Sliders',
    category: 'System',
    description: 'Customize wallpaper shaders, color themes, sound fx, and hardware monitoring.',
    defaultSize: { width: 760, height: 560 },
    minSize: { width: 520, height: 420 },
    pinnedToDock: true,
    addedDate: '2026-07-25',
    defaultUsage: 38,
  },
  {
    id: 'app-hub',
    title: 'Aether Hub',
    iconName: 'Boxes',
    category: 'System',
    description: 'Discover spatial applications, quantum modules, and community tools.',
    defaultSize: { width: 780, height: 540 },
    minSize: { width: 520, height: 400 },
    pinnedToDock: false,
    addedDate: '2026-08-12',
    defaultUsage: 29,
  },
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Welcome to Aether.OS 🌌',
    content: `# Welcome to Aether.OS (v3.4.1 Quantum)

Aether.OS is an ethereal, spatial web desktop designed for high focus, deep creative work, and neural exploration.

### 🌟 Key Capabilities:
- **Neural Core (Cmd+Space / Spotlight)**: Ask questions, generate concepts, and synthesize ideas.
- **Nebula Sound Lab**: Engage focus through procedural 432Hz binaural drone & ambient rain synthesis.
- **Quantum Shell**: Run real-time CLI commands (\`neofetch\`, \`matrix\`, \`gemini <prompt>\`, \`calc\`).
- **Synaptic Graph**: Switch between editor and interactive neural mind-map.
- **Cosmic Code Studio**: Sandbox live shaders, canvas graphics, and interactive CSS creations.

*Try dragging windows to screen edges to snap them, or switch between 4 spatial workspaces from the top bar!*`,
    tags: ['welcome', 'guide', 'system'],
    color: '#8b5cf6',
    isPinned: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Quantum State Synchronization',
    content: `## Principles of Spatial Computing
1. **Zero Distraction**: Floating glass interfaces that breathe with ambient light.
2. **Procedural Resonance**: Audio harmonics tuned to circadian brainwaves.
3. **Instantaneous Knowledge**: Everything reachable within 2 keystrokes (\`Cmd+K\`).

\`\`\`ts
interface QuantumNode {
  coherence: number;
  spin: 'up' | 'down';
  entangledWith: string[];
}
\`\`\``,
    tags: ['quantum', 'architecture'],
    color: '#06b6d4',
    isPinned: false,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Nebula Audio Synthesizer Notes',
    content: `### Synthesizer Modes
- **Theta Wave (6Hz beat)**: Deep meditation and cognitive regeneration.
- **432Hz Natural Harmonics**: Harmonic alignment for focused programming.
- **Cosmic Drone**: Tri-oscillator warm pad with subtle LFO modulation.`,
    tags: ['audio', 'synth', 'focus'],
    color: '#ec4899',
    isPinned: false,
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const INITIAL_FILE_SYSTEM: FileItem[] = [
  {
    id: 'dir-root',
    name: 'Vault',
    type: 'folder',
    path: '/',
    updatedAt: new Date().toISOString(),
    children: [
      {
        id: 'dir-docs',
        name: 'Documents',
        type: 'folder',
        path: '/Documents',
        updatedAt: new Date().toISOString(),
        children: [
          {
            id: 'file-genesis',
            name: 'Aether_Manifesto.md',
            type: 'text',
            size: '2.4 KB',
            path: '/Documents/Aether_Manifesto.md',
            content: `The spatial operating system is not a desktop with file icons; it is an extension of consciousness.\nAether.OS synthesizes sound, light, and computation into one unified medium.`,
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'file-shortcuts',
            name: 'Keyboard_Shortcuts.txt',
            type: 'text',
            size: '1.1 KB',
            path: '/Documents/Keyboard_Shortcuts.txt',
            content: `AETHER.OS SHORTCUTS:\n• Cmd / Ctrl + K: Omni Search / Spotlight\n• Alt + 1-4: Switch Virtual Workspace\n• Alt + W: Close Active Window\n• Alt + M: Minimize Active Window\n• Alt + F: Maximize / Restore Window`,
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'dir-code',
        name: 'Projects',
        type: 'folder',
        path: '/Projects',
        updatedAt: new Date().toISOString(),
        children: [
          {
            id: 'file-plasma',
            name: 'plasma_orb.html',
            type: 'code',
            size: '1.8 KB',
            path: '/Projects/plasma_orb.html',
            content: `<!DOCTYPE html><html><body style="margin:0;background:#060814;display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden;"><canvas id="c"></canvas><script>const c=document.getElementById('c'),x=c.getContext('2d');let w,h;function r(){w=c.width=window.innerWidth;h=c.height=window.innerHeight;}r();window.onresize=r;let t=0;function loop(){t+=0.02;x.fillStyle='rgba(6,8,20,0.2)';x.fillRect(0,0,w,h);for(let i=0;i<12;i++){x.beginPath();x.arc(w/2+Math.sin(t+i)*80,h/2+Math.cos(t*0.8+i)*80,15+Math.sin(t*2+i)*8,0,7);x.fillStyle=\`hsl(\${(t*50+i*30)%360},80%,65%)\`;x.shadowBlur=25;x.shadowColor=x.fillStyle;x.fill();}requestAnimationFrame(loop);}loop();</script></body></html>`,
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'dir-sys',
        name: 'System',
        type: 'folder',
        path: '/System',
        updatedAt: new Date().toISOString(),
        children: [
          {
            id: 'file-kernel-log',
            name: 'kernel.log',
            type: 'text',
            size: '4.8 KB',
            path: '/System/kernel.log',
            content: `[0.000000] Aether Microkernel 3.4.1 booting...\n[0.001200] ACPI: Initialized 16 Quantum Cores\n[0.003400] Neural Subsystem: Online [Latency 0.8ms]\n[0.005100] Web Audio DSP Engine: Initialized\n[0.008900] Spatial Compositor: 60FPS Sync Locked`,
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    ],
  },
];
