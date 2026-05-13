import React from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/shared/atoms/Icon";
import { extractPlanSlug } from "@/utils/planId";

interface PlanCardProps {
  id?: string;
  title: string;
  description: string;
  image: string;
  price: string;
  rating: string;
  duration: string;
  tag: string;
  tagIcon: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  id,
  title,
  description,
  image,
  price,
  rating,
  duration,
  tag,
  tagIcon,
}) => {
  const href = id ? `/planes/${extractPlanSlug(id)}` : "/planes";

  return (
    <Link
      className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer"
      href={href}
      title={`Ver detalle de ${title}`}
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={title}
          title={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
          <span aria-hidden="true">{"\u2B50"}</span> {rating}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-3 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1">
            <Icon name="schedule" className="text-sm" />
            {duration}
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Icon name={tagIcon} className="text-sm" />
            {tag}
          </div>
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
        <p className="text-slate-500 text-sm mb-6 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Desde
            </span>
            <p className="text-2xl font-black text-slate-900">
              {price}{" "}
              <span className="text-sm font-normal text-slate-400">/pp</span>
            </p>
          </div>
          <span
            aria-hidden="true"
            className="bg-primary/10 text-primary px-3 py-2 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
          >
            <Icon name="add_shopping_cart" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PlanCard;
