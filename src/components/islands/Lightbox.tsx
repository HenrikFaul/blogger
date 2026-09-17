import React, { useState, useEffect, useCallback } from 'react';

interface Image {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

interface LightboxProps {
  images: Image[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Save previously focused element
    const previousFocus = document.activeElement as HTMLElement;
    
    // Focus the lightbox container
    const lightboxNode = document.getElementById('lightbox-container');
    if (lightboxNode) lightboxNode.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      
      // Focus Trap
      if (e.key === 'Tab') {
        const focusableElements = lightboxNode?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousFocus) previousFocus.focus();
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      id="lightbox-container"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm focus:outline-none"
      role="dialog"
      aria-modal="true"
      aria-label="Képnézegető"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded-full transition-colors"
        aria-label="Bezárás (Escape)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-8">
        {images.length > 1 && (
          <button 
            onClick={handlePrev}
            className="absolute left-4 z-50 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Előző kép (Balra nyíl)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        )}

        <img 
          src={currentImage.src} 
          alt={currentImage.alt || `Kép ${currentIndex + 1} / ${images.length}`}
          className="max-w-full max-h-[85vh] object-contain rounded-md"
        />

        {(currentImage.caption || currentImage.credit || images.length > 1) && (
          <div className="absolute bottom-8 left-0 right-0 text-center px-4">
            <div className="inline-block bg-black/80 text-white px-6 py-3 rounded-xl max-w-2xl">
              {currentImage.caption && <p className="font-medium text-sm sm:text-base">{currentImage.caption}</p>}
              {currentImage.credit && <p className="text-xs text-white/60 mt-1">{currentImage.credit}</p>}
              {images.length > 1 && (
                <p className="text-xs font-mono text-white/40 mt-2">
                  {currentIndex + 1} / {images.length}
                </p>
              )}
            </div>
          </div>
        )}

        {images.length > 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-4 z-50 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Következő kép (Jobbra nyíl)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        )}
      </div>
    </div>
  );
};

// A small wrapper to handle the mounting of the lightbox triggered from plain HTML elements
export const LightboxWrapper: React.FC<{ images: Image[] }> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    // Listen for custom events dispatched by the vanilla Gallery component
    const handleOpenLightbox = (e: CustomEvent<{ index: number }>) => {
      setStartIndex(e.detail.index);
      setIsOpen(true);
    };

    window.addEventListener('open-lightbox' as any, handleOpenLightbox);
    return () => window.removeEventListener('open-lightbox' as any, handleOpenLightbox);
  }, []);

  return (
    <Lightbox 
      images={images} 
      initialIndex={startIndex} 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
    />
  );
};
