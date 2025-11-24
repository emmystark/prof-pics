import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Sparkles, RefreshCw, AlertCircle, X, Camera } from 'lucide-react';
import { Button } from './components/Button';
import { StyleSelector } from './components/StyleSelector';
import { ProfessionalStyle, BackgroundStyle, ProcessingState } from './types';
import { generateHeadshot } from './services/geminiService';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [style, setStyle] = useState<ProfessionalStyle>('startup');
  const [background, setBackground] = useState<BackgroundStyle>('office');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [state, setState] = useState<ProcessingState>({ status: 'idle' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation
      if (file.size > 5 * 1024 * 1024) {
        setState({ status: 'error', error: 'File size too large. Max 5MB.' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setState({ status: 'idle' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setState({ status: 'processing' });
    setGeneratedImage(null);

    try {
      // Parse base64 data and mime type
      const matches = selectedImage.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid image format");
      }
      const mimeType = matches[1];
      const base64Data = matches[2];
      
      const result = await generateHeadshot(base64Data, mimeType, style, background, customPrompt);
      
      setGeneratedImage(`data:${result.mimeType};base64,${result.data}`);
      setState({ status: 'completed' });
    } catch (error) {
      setState({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to generate image. Please try again.' 
      });
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      // Extract extension from mime type for correct file saving
      const mimeType = generatedImage.substring(5, generatedImage.indexOf(';'));
      const ext = mimeType.split('/')[1] || 'jpg';
      link.download = `pro-headshot-${style}-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setCustomPrompt('');
    setState({ status: 'idle' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              ProProfile AI
            </h1>
          </div>
          <div className="text-xs text-zinc-500 font-medium border border-zinc-800 px-3 py-1 rounded-full hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Intro Text */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Create your professional persona</h2>
              <p className="text-zinc-400">
                Upload a casual selfie and transform it into a sleek, professional headshot perfect for LinkedIn and Twitter.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {/* Step 1: Upload */}
              <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-semibold text-zinc-200">1. Upload Selfie</h3>
                   {selectedImage && (
                     <button onClick={reset} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                       <X size={12}/> Clear
                     </button>
                   )}
                </div>
                
                {!selectedImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 hover:border-blue-500/50 transition-all group h-48"
                  >
                    <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                      <Upload className="h-6 w-6 text-zinc-400 group-hover:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Click to upload photo</span>
                    <span className="text-xs text-zinc-500 mt-1">JPG or PNG, max 5MB</span>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden aspect-[4/5] border border-zinc-700 group">
                    <img src={selectedImage} alt="Original" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-xs font-medium text-white ml-1">Original Image</span>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Step 2: Configure */}
              <div className={`transition-opacity duration-300 ${!selectedImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <StyleSelector 
                  selectedStyle={style} 
                  selectedBackground={background}
                  customPrompt={customPrompt}
                  onStyleChange={setStyle}
                  onBackgroundChange={setBackground}
                  onCustomPromptChange={setCustomPrompt}
                />
              </div>

              {/* Step 3: Generate */}
              <div className="pt-4">
                <Button 
                  onClick={handleGenerate} 
                  className="w-full py-4 text-lg"
                  disabled={!selectedImage}
                  isLoading={state.status === 'processing'}
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Headshot
                </Button>
                {state.error && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {state.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Preview/Result */}
          <div className="lg:col-span-8 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 p-6 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>

            {state.status === 'idle' && !generatedImage && (
              <div className="text-center text-zinc-500 max-w-sm">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                  <Camera className="w-10 h-10 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Ready to Transform</h3>
                <p>Upload a photo and select a style to see the AI magic happen. For best results, use a photo with good lighting and a clear view of your face.</p>
              </div>
            )}

            {state.status === 'processing' && (
              <div className="text-center z-10 animate-pulse">
                <div className="w-64 h-80 bg-zinc-800 rounded-xl mb-4 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent -translate-y-full animate-[shimmer_1.5s_infinite]"></div>
                </div>
                <p className="text-blue-400 font-medium">Analyzing facial features...</p>
                <p className="text-zinc-500 text-sm mt-1">Applying {style} style...</p>
              </div>
            )}

            {generatedImage && (
              <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out] z-10">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-zinc-700 shadow-2xl">
                    <img 
                      src={generatedImage} 
                      alt="Generated Professional Headshot" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Floating Action Bar */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md px-2 py-2 rounded-full border border-zinc-700 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button 
                       onClick={downloadImage}
                       className="p-3 hover:bg-white/10 rounded-full text-white transition-colors tooltip"
                       title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <div className="w-px h-6 bg-zinc-700"></div>
                    <button 
                       onClick={handleGenerate}
                       className="p-3 hover:bg-white/10 rounded-full text-white transition-colors"
                       title="Regenerate"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex gap-4 justify-center">
                  <Button onClick={downloadImage} variant="primary" className="w-full">
                    Download High Res
                  </Button>
                </div>
                <p className="text-center text-zinc-500 text-xs mt-4">
                  AI generated images may contain artifacts. Review carefully before use.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;