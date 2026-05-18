"use client";

import React from "react";
import Image from "next/image";
import Icon from "@/components/shared/atoms/Icon";

interface SiteDetailGalleryProps {
  images: string[];
  siteName: string;
  siteType: string;
}

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBY1klAlCQOfuHA6CgrxkjVs4iCIGAy7zEuyyS35TzmjF_Qup91FVQ40oGDTFlfxdtCKF6ZG8h16Oro9Y1LfiYjo_6NjXHq_jhN-YtHybBlbAbyem2SZy7bB5YwQQZtmZCubOHd3swZ-pH9QKhIlw1cVYXxma7RN0r8Q3UAo1lGGZBo_vdg0So25bp5rFm58hqCwTy89xdH0jJ9Ea4kb_FjZMZJrvZit2yyyjvzThSgkm_oft16TIAv1BAs2WH-xLJe86TeBkph6SpP";

const getGalleryTitle = (siteType: string) => {
  const normalized = siteType.toLowerCase();

  if (normalized.includes("cascada")) return "Galería de la cascada";
  if (normalized.includes("río") || normalized.includes("rio")) return "Galería del río";
  if (normalized.includes("parque")) return "Galería del parque natural";
  if (normalized.includes("reserva")) return "Galería de la reserva natural";
  if (normalized.includes("cultural")) return "Galería cultural del destino";
  if (normalized.includes("ecosistema")) return "Galería del ecosistema";
  return `Galería de ${siteType.toLowerCase()}`;
};

const SiteDetailGallery: React.FC<SiteDetailGalleryProps> = ({
  images,
  siteName,
  siteType,
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const sanitized = images.map((item) => item.trim()).filter(Boolean);
  const safeImages = [...sanitized];

  while (safeImages.length < 4) {
    safeImages.push(safeImages[safeImages.length - 1] ?? FALLBACK_IMAGE);
  }

  const closeModal = React.useCallback(() => setActiveIndex(null), []);

  const showPrev = React.useCallback(() => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === null) return prevIndex;
      return (prevIndex + safeImages.length - 1) % safeImages.length;
    });
  }, [safeImages.length]);

  const showNext = React.useCallback(() => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === null) return prevIndex;
      return (prevIndex + 1) % safeImages.length;
    });
  }, [safeImages.length]);

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
  }, [activeIndex, closeModal, showPrev, showNext]);

  const imageCard = (index: number, className: string, sizes: string, alt: string) => (
    <button
      type="button"
      className={`${className} relative overflow-hidden rounded-3xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40`}
      onClick={() => setActiveIndex(index)}
      title="Ver imagen en detalle"
    >
      <Image
        src={safeImages[index]}
        alt={alt}
        title={alt}
        fill
        sizes={sizes}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
    </button>
  );

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-8">
        {getGalleryTitle(siteType)}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-150">
        {imageCard(
          0,
          "col-span-2 row-span-2",
          "(min-width: 1024px) 50vw, 100vw",
          `${siteName} - imagen principal`,
        )}
        {imageCard(
          1,
          "col-span-2 row-span-1",
          "(min-width: 1024px) 50vw, 100vw",
          `${siteName} - imagen secundaria`,
        )}
        {imageCard(
          2,
          "col-span-1 row-span-1",
          "(min-width: 1024px) 25vw, 50vw",
          `${siteName} - imagen 3`,
        )}
        {imageCard(
          3,
          "col-span-1 row-span-1",
          "(min-width: 1024px) 25vw, 50vw",
          `${siteName} - imagen 4`,
        )}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes del sitio"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden bg-black">
              <Image
                src={safeImages[activeIndex]}
                alt={`${siteName} - imagen ${activeIndex + 1}`}
                title={`${siteName} - imagen ${activeIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-white text-sm">
              <span>
                {activeIndex + 1} / {safeImages.length}
              </span>
              <span className="max-w-xs truncate">{siteName}</span>
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

export default SiteDetailGallery;
