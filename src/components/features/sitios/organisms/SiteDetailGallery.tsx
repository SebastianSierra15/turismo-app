import React from "react";
import Image from "next/image";

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
  const sanitized = images.map((item) => item.trim()).filter(Boolean);
  const safeImages = [...sanitized];

  while (safeImages.length < 4) {
    safeImages.push(safeImages[safeImages.length - 1] ?? FALLBACK_IMAGE);
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-8">
        {getGalleryTitle(siteType)}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-150">
        <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden relative cursor-crosshair">
          <Image
            src={safeImages[0]}
            alt={`${siteName} - imagen principal`}
            title={`${siteName} - imagen principal`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-crosshair"
          />
        </div>
        <div className="col-span-2 row-span-1 rounded-3xl overflow-hidden relative cursor-crosshair">
          <Image
            src={safeImages[1]}
            alt={`${siteName} - imagen secundaria`}
            title={`${siteName} - imagen secundaria`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-crosshair"
          />
        </div>
        <div className="col-span-1 row-span-1 rounded-3xl overflow-hidden relative cursor-crosshair">
          <Image
            src={safeImages[2]}
            alt={`${siteName} - imagen 3`}
            title={`${siteName} - imagen 3`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-crosshair"
          />
        </div>
        <div className="col-span-1 row-span-1 rounded-3xl overflow-hidden relative cursor-crosshair">
          <Image
            src={safeImages[3]}
            alt={`${siteName} - imagen 4`}
            title={`${siteName} - imagen 4`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-crosshair"
          />
        </div>
      </div>
    </section>
  );
};

export default SiteDetailGallery;
