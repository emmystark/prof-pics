export type ProfessionalStyle = 'startup' | 'corporate' | 'minimalist' | 'creative';
export type BackgroundStyle = 'studio' | 'office' | 'bokeh' | 'gradient';

export interface GenerationConfig {
  style: ProfessionalStyle;
  background: BackgroundStyle;
  customPrompt?: string;
}

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}
