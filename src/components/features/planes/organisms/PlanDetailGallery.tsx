"use client";

import React from "react";
import Image from "next/image";
import Icon from "@/components/shared/atoms/Icon";

interface GalleryImage {
  image: string;
  alt: string;
  label?: string;
  href?: string;
}

interface PlanDetailGalleryProps {
  images: GalleryImage[];
}

const PlanDetailGallery: React.FC<PlanDetailGalleryProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const closeModal = React.useCallback(() => setActiveIndex(null), []);

  const showPrev = React.useCallback(() => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === null) return prevIndex;
      return (prevIndex + images.length - 1) % images.length;
    });
  }, [images.length]);

  const showNext = React.useCallback(() => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === null) return prevIndex;
      return (prevIndex + 1) % images.length;
    });
  }, [images.length]);

  React.useEffect(() => {
    if (activeIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex, images.length, closeModal, showNext, showPrev]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Icon name="photo_library" className="text-primary" />
        Galería de la expedición
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((item, index) => (
          item.href ? (
            <a
              key={`${item.image}-${item.label ?? item.alt}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-32 w-full overflow-hidden rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
              title="Abrir detalle del sitio en una nueva pestaña"
            >
              <Image
                src={item.image}
                alt={item.alt}
                title={item.label ?? item.alt}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {item.label && (
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-semibold drop-shadow">
                    {item.label}
                  </span>
                </div>
              )}
            </a>
          ) : (
            <button
              key={`${item.image}-${item.label ?? item.alt}`}
              type="button"
              className="group relative h-32 w-full overflow-hidden rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
              onClick={() => setActiveIndex(index)}
              title="Ver imagen en detalle"
            >
              <Image
                src={item.image}
                alt={item.alt}
                title={item.label ?? item.alt}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {item.label && (
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-semibold drop-shadow">
                    {item.label}
                  </span>
                </div>
              )}
            </button>
          )
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden bg-black">
              <Image
                src={images[activeIndex].image}
                alt={images[activeIndex].alt}
                title={images[activeIndex].alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-white text-sm">
              <span>
                {activeIndex + 1} / {images.length}
              </span>
              <span className="max-w-xs truncate">
                {images[activeIndex].label ?? images[activeIndex].alt}
              </span>
            </div>
            <button
              type="button"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg hover:bg-white cursor-pointer"
              onClick={closeModal}
              title="Cerrar galería"
            >
              <Icon name="close" />
            </button>
            <button
              type="button"
              className="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg hover:bg-white cursor-pointer"
              onClick={showPrev}
              title="Imagen anterior"
            >
              <Icon name="chevron_left" />
            </button>
            <button
              type="button"
              className="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg hover:bg-white cursor-pointer"
              onClick={showNext}
              title="Imagen siguiente"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PlanDetailGallery;
