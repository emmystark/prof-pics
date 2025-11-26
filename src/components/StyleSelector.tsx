import React from 'react';
import { ProfessionalStyle, BackgroundStyle } from '../types';
import { Briefcase, Building, Monitor, Palette, Camera, LayoutGrid, Trees, MessageSquare } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: ProfessionalStyle;
  selectedBackground: BackgroundStyle;
  customPrompt: string;
  onStyleChange: (s: ProfessionalStyle) => void;
  onBackgroundChange: (b: BackgroundStyle) => void;
  onCustomPromptChange: (p: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  selectedBackground,
  customPrompt,
  onStyleChange,
  onBackgroundChange,
  onCustomPromptChange
}) => {
  
  const styles: {id: ProfessionalStyle, label: string, desc: string, icon: React.ReactNode}[] = [
    { id: 'startup', label: 'Tech Lead', desc: 'Smart casual, polo or blazer.', icon: <Monitor size={20} /> },
    { id: 'corporate', label: 'Executive', desc: 'Full suit and tie, formal.', icon: <Briefcase size={20} /> },
    { id: 'minimalist', label: 'Minimalist', desc: 'Solid colors, clean lines.', icon: <LayoutGrid size={20} /> },
    { id: 'creative', label: 'Creative', desc: 'Stylish, modern layered look.', icon: <Palette size={20} /> },
  ];

  const backgrounds: {id: BackgroundStyle, label: string, icon: React.ReactNode}[] = [
    { id: 'office', label: 'Modern Office', icon: <Building size={18} /> },
    { id: 'studio', label: 'Dark Studio', icon: <Camera size={18} /> },
    { id: 'bokeh', label: 'City Bokeh', icon: <Trees size={18} /> },
    { id: 'gradient', label: 'Soft Gradient', icon: <LayoutGrid size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Clothing Style</h3>
        <div className="grid grid-cols-2 gap-3">
          {styles.map((item) => (
            <button
              key={item.id}
              onClick={() => onStyleChange(item.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedStyle === item.id
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="mb-2">{item.icon}</div>
              <div className="font-medium text-zinc-200">{item.label}</div>
              <div className="text-xs text-zinc-500 mt-1">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Background</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {backgrounds.map((item) => (
            <button
              key={item.id}
              onClick={() => onBackgroundChange(item.id)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center gap-2 ${
                selectedBackground === item.id
                  ? 'bg-zinc-800 border-zinc-600 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare size={14} />
          Additional Instructions <span className="text-zinc-600 normal-case tracking-normal">(Optional)</span>
        </h3>
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="e.g. Fix my messy hair, make me smile slightly, remove glasses, darker blazer..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none h-24 placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
};