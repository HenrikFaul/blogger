import React, { useState } from 'react';
import { Lightbox, type LightboxImage } from './Lightbox';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export type GalleryLayout = 
  | 'editorial-grid' 
  | 'masonry' 
  | 'justified' 
  | 'carousel' 
  | 'stacked' 
  | 'filmstrip' 
  | 'comparison' 
  | 'full-bleed' 
  | 'lightbox' 
  | 'mixed';

export interface GalleryImageDef extends LightboxImage {
  decorative?: boolean;
  credit?: string;
  mediaType?: 'image' | 'video' | 'embed';
  embedUrl?: string;
  comparisonAfterSrc?: string;
}

export interface GalleryProps {
  images: GalleryImageDef[];
  layout?: GalleryLayout;
  columns?: number;
  gap?: 'none' | 'small' | 'medium' | 'large';
  captions?: 'none' | 'hover' | 'always' | 'below';
  clickBehavior?: 'lightbox' | 'none' | 'link';
  aspectRatio?: 'auto' | 'square' | 'landscape' | 'portrait';
}

export function Gallery({
  images,
  layout = 'editorial-grid',
  columns = 3,
  gap = 'medium',
  captions = 'hover',
  clickBehavior = 'lightbox',
  aspectRatio = 'auto'
}: GalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    if (clickBehavior !== 'lightbox') return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const gapClass = {
    'none': 'gap-0',
    'small': 'gap-2',
    'medium': 'gap-4',
    'large': 'gap-8'
  }[gap];

  const aspectClass = {
    'auto': 'aspect-auto',
    'square': 'aspect-square',
    'landscape': 'aspect-video',
    'portrait': 'aspect-[3/4]'
  }[aspectRatio];

  const renderImage = (img: GalleryImageDef, idx: number, className = '') => (
    <div 
      key={idx} 
      className={`relative group overflow-hidden bg-surface-raised rounded-lg premium-shadow ${className} ${clickBehavior === 'lightbox' ? 'cursor-pointer' : ''}`}
      onClick={() => openLightbox(idx)}
    >
      <img 
        src={img.src} 
        alt={img.alt || ''} 
        className={`w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${aspectClass}`}
        loading={idx < 2 ? 'eager' : 'lazy'}
      />
      
      {clickBehavior === 'lightbox' && (
         <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 z-10">
            <Maximize2 size={16} />
         </div>
      )}

      {img.caption && captions !== 'none' && (
        <div className={`absolute inset-x-0 bottom-0 pt-20 pb-5 px-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end transition-opacity duration-500 z-10 ${captions === 'hover' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <span className="text-white text-sm font-medium drop-shadow-md">{img.caption}</span>
        </div>
      )}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'editorial-grid':
        return (
          <div 
            className={`grid ${gapClass}`} 
            style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${100 / columns}%), 1fr))` }}
          >
            {images.map((img, idx) => renderImage(img, idx))}
          </div>
        );

      case 'masonry':
        // A simple CSS column based masonry
        return (
          <div 
            className={`columns-1 sm:columns-2 md:columns-${columns} ${gapClass} space-y-${gap === 'none' ? '0' : gap === 'small' ? '2' : gap === 'medium' ? '4' : '8'}`}
          >
            {images.map((img, idx) => renderImage(img, idx, 'mb-4 break-inside-avoid'))}
          </div>
        );

      case 'carousel':
        return (
          <div className="relative w-full overflow-hidden flex snap-x snap-mandatory hide-scrollbar">
             {images.map((img, idx) => (
                <div key={idx} className="min-w-full snap-center shrink-0 p-2">
                  {renderImage(img, idx, 'w-full')}
                </div>
             ))}
          </div>
        );

      case 'filmstrip':
        return (
          <div className="flex flex-col gap-4">
             {renderImage(images[lightboxIndex] || images[0], lightboxIndex || 0, 'w-full')}
             <div className="flex gap-2 overflow-x-auto pb-2">
               {images.map((img, idx) => (
                 <button 
                   key={idx} 
                   className={`shrink-0 w-24 h-24 rounded-md overflow-hidden ring-2 transition-all ${idx === lightboxIndex ? 'ring-primary opacity-100' : 'ring-transparent opacity-60 hover:opacity-100'}`}
                   onClick={() => setLightboxIndex(idx)}
                 >
                   <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                 </button>
               ))}
             </div>
          </div>
        );
        
      case 'full-bleed':
        return (
          <div className="w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] my-12">
            {images.map((img, idx) => renderImage(img, idx, 'w-full h-[60vh] md:h-[80vh] rounded-none'))}
          </div>
        );

      case 'stacked':
        return (
          <div className={`flex flex-col ${gapClass}`}>
            {images.map((img, idx) => renderImage(img, idx, 'w-full'))}
          </div>
        );

      case 'lightbox':
        return (
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
               <button 
                 key={idx} 
                 className="relative w-16 h-16 rounded-md overflow-hidden ring-1 ring-border hover:ring-primary transition-all"
                 onClick={() => openLightbox(idx)}
               >
                 <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                 {idx === images.length - 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                       +{images.length}
                    </div>
                 )}
               </button>
            ))}
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, idx) => renderImage(img, idx))}
          </div>
        );
    }
  };

  return (
    <div className="my-8 relative w-full">
      {renderLayout()}
      
      {clickBehavior === 'lightbox' && (
        <Lightbox 
          images={images} 
          isOpen={lightboxOpen} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}
    </div>
  );
}
