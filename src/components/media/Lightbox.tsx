import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Sync state if initialIndex changes while closed
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
    }
  }, [isOpen, initialIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
  }, [images.length]);

  // Keyboard navigation & Focus Trap
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();

      // Focus trap logic
      if (e.key === 'Tab') {
        const focusableElements = lightboxRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    // Auto focus first element to start trap
    setTimeout(() => {
       const focusableElements = lightboxRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
       );
       if (focusableElements && focusableElements.length > 0) {
         focusableElements[0].focus();
       }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleNext, handlePrevious]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      ref={lightboxRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      role="dialog"
      aria-modal="true"
      aria-label={`Kép ${currentIndex + 1} / ${images.length}: ${currentImage.alt}`}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent z-10 text-white">
        <div className="text-sm font-medium tracking-wide">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setScale(s => Math.min(s + 0.5, 3))}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            onClick={() => setScale(s => Math.max(s - 0.5, 1))}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Zoom Out"
            disabled={scale <= 1}
          >
            <ZoomOut size={20} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrevious}
            className="absolute left-4 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 z-10"
            aria-label="Previous Image"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 z-10"
            aria-label="Next Image"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Main Image Container */}
      <div 
        className="w-full h-full flex items-center justify-center p-4 sm:p-12"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img 
          key={currentImage.src}
          src={currentImage.src} 
          alt={currentImage.alt} 
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none animate-in zoom-in-95"
          style={{ transform: `scale(${scale})` }}
        />
      </div>

      {/* Caption Bottom Bar */}
      {currentImage.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center z-10 pointer-events-none">
          <p className="text-white text-lg font-medium drop-shadow-md">
            {currentImage.caption}
          </p>
        </div>
      )}
    </div>
  );
}
