"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const BACKGROUNDS = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6aB1OqFsG8iGytQuO0egF3B0bKBfpBOOPUgucjEZsQF_C29aXAs250nRCqTowYlR5YST7RoQ0sPNEiWUySv_-vOGT0bAwo-NJSckOjK8luPe6JV91KXnxy0g9tHbrY5bpSSdymFd6udL5qYgiCelDClo4xtYLod-BZwqGDsJhj7w8Zuvdhak-yA9F7Y0pvkzD2Bd4voVVI8J1yrI7y-jtkXRBvqBD50I1StK3NahD_YV2fo1ng7iW5FIWu2n7Cd-Ro7-oh6UNpJo",
    alt: "Paisaje amazónico con río y cascada en Caquetá",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxnl6JlaU7j0kiMxtS4aZPGnG7uAU4t2juu3EaDfMBEI_HdP9rkXclSouUgUoBgDgreo6AD8kr7KEt-n1wMKnPxHVYemeKH9a1I2Y_fcCMBBwwJp_lC_S1bQtKHBde-8hykTS36a6KT8h5RuPsNMTO2GK3GSUhppqj01bQmZAGtJgcff6Uw8r2v030Xwy2i3xTjkuYhPSePlgm7nIBNH5c7pbBGHxM6As1I-uowK4noOmOwgXHLGlS0XKxTLxWfT5sNNnt7izXNy4",
    alt: "Aventura en el río Hacha, Caquetá",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBwTnuiGsMb3EBMuTDQlRIV5PgZ-tG3WRP36LRpYyO-L-j0SGpyVJFToZTpVRW68vdtvgG-_JaaEXcxTIfwM2Y8da8zApmpyHtkZuc2nrgnb5yB9lUMl_lA4pNOQV22mFk7oeO4SkZlsBiF-BP16sjjWmgArHFuNbBP1AIL5Kg4zcwCBMh4xLRuvqviQ8cLBaYoizInL05C-k_y-qycA1VGAjNKu7R2ZkXbsbGIKwVAsMJLCyasOhRx0DKFctnMzOeIHUg0BtTCWdA",
    alt: "Paisaje selvático del Caquetá",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUPQ4FTaudHjVh2_9d1HiiK6eusfERSGpn7oMsCDbheNkDXeULpV_DGhVDdxWUNxKgonnPyeG8qVo7oKw3hRBPw3k_52kxUodBxifXEGMG90eIyZKkSYsfMLUxGQuAaG5BVWb7JeoFPSvcmBEztctvkJ7FcAg6W1JJjBIt7WfRoKtK5NTMAnUZFp_BVpmYpIYpXwNupbuk7nEDq9qOle24pHekLpTzVV5leM91Dj8xb9na0eDXQOwyru2GZYJcQfAXkOqNIkyQy2o",
    alt: "Selva amazónica del Caquetá",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuACIPCeuaxb96R-SaywaQUN_XcMFMUXM6NRMH8C0_MIoTvgdbx6cajPu0Pns7DkGzf3l23-ZCWs_dnOJrOSwnulwtShpSnolzUN3rTeqennEgUShJkEzYXRbHZ0a_BxbZ6ph31B12OJm5sYafBAONYMqSlyzV0nqfwxSx4Ov4IA0Vqvwv60YqAlXeRdvd6YT99i-kEsRK34To1I-bYFSESkXLare6F8LE3mX2CsxN4I-lU7iL5dZx2qmnbOyyOX0Ox7HbgrruIdJh6r",
    alt: "Destino natural de Caquetá",
  },
] as const;

const AUTOPLAY_INTERVAL = 4000;

export default function HeroBackgroundCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) =>
        (currentIndex + 1) % BACKGROUNDS.length,
      );
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="absolute inset-0">
      {BACKGROUNDS.map((background, index) => (
        <Image
          key={background.src}
          src={background.src}
          alt={index === activeIndex ? background.alt : ""}
          title={index === activeIndex ? background.alt : undefined}
          fill
          sizes="100vw"
          priority={index === 0}
          aria-hidden={index !== activeIndex}
          className={`object-cover transition-[opacity,transform] ${
            prefersReducedMotion ? "duration-0" : "duration-[1800ms] ease-in-out"
          } ${
            index === activeIndex ? "scale-105 opacity-100" : "scale-100 opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
    </div>
  );
}
