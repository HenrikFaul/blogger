import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4'];

export function ImageUploader({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const validateFiles = (files: FileList): File[] => {
    setError(null);
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`A(z) "${file.name}" formátuma nem támogatott. (Csak képek és MP4 videók engedélyezettek)`);
        return [];
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`A(z) "${file.name}" túl nagy. (Max. ${MAX_FILE_SIZE_MB}MB)`);
        return [];
      }
      validFiles.push(file);
    }
    return validFiles;
  };

  const simulateUpload = (files: FileList) => {
    if (files.length === 0) return;
    
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) return; // Validation failed
    
    setIsUploading(true);
    setProgress(0);
    setSuccess(false);
    setError(null);
    
    // Simulate realistic upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            setProgress(0);
            if (onUploadComplete) onUploadComplete();
          }, 2000);
        }, 500);
      } else {
        setProgress(currentProgress);
      }
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full bg-surface border border-border/60 rounded-2xl p-8 premium-shadow transition-all duration-300">
      <h3 className="text-xl font-heading font-bold mb-6 text-foreground flex items-center gap-2">
        Média feltöltése
      </h3>
      
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success ? (
        <div className="border-2 border-dashed border-success/30 rounded-xl p-10 flex flex-col items-center justify-center bg-success/5 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 text-success">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-foreground font-heading font-semibold text-lg mb-1">Sikeres feltöltés!</p>
          <p className="text-sm text-muted-foreground">A fájlok bekerültek a médiatárba.</p>
        </div>
      ) : !isUploading ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg' 
              : 'border-border/60 hover:bg-surface-raised hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] z-0 pointer-events-none animate-in fade-in duration-300"></div>
          )}
          
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            multiple 
            accept={ALLOWED_TYPES.join(',')}
            onChange={(e) => e.target.files && simulateUpload(e.target.files)}
          />
          
          <div className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${isDragging ? 'bg-primary text-primary-contrast scale-110 shadow-md' : 'bg-surface-raised text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105'}`}>
            <UploadCloud size={32} className="transition-transform duration-300 group-hover:-translate-y-1" />
          </div>
          
          <p className="text-foreground font-heading font-medium text-lg mb-2 z-10 text-center">
            {isDragging ? 'Engedd el a fájlok feltöltéséhez...' : 'Kattints vagy húzd ide a fájlokat'}
          </p>
          <p className="text-sm text-muted-foreground z-10 text-center max-w-sm">
            Támogatott formátumok: JPG, PNG, WebP, AVIF, GIF, MP4 (Max {MAX_FILE_SIZE_MB}MB)
          </p>
        </div>
      ) : (
        <div className="border border-border/60 rounded-xl p-10 flex flex-col items-center justify-center bg-surface-raised shadow-inner">
          <div className="relative w-20 h-20 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-border/50" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="currentColor" 
                className="text-primary transition-all duration-300 ease-out" 
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold font-heading">{Math.round(progress)}%</span>
            </div>
          </div>
          <p className="text-foreground font-heading font-medium mb-1">Feltöltés folyamatban...</p>
          <p className="text-xs text-muted-foreground">Kérlek, ne zárd be az oldalt.</p>
        </div>
      )}
    </div>
  );
}
