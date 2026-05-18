"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/atoms/Icon";
import TourCard from "@/components/features/planes/molecules/TourCard";
import { type PlanCatalogItem } from "@/types/planCatalog";
import { getFavoritePlans, removeFavoritePlan } from "@/services/profile";

interface ProfileFavoritesProps {
  token: string;
}

const ProfileFavorites: React.FC<ProfileFavoritesProps> = ({ token }) => {
  const [favorites, setFavorites] = React.useState<PlanCatalogItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const fetchFavorites = React.useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getFavoritePlans(token);
      setFavorites(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar tus favoritos",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (id: string) => {
    const previousFavorites = favorites;
    setFavorites((current) => current.filter((plan) => plan.id !== id));

    try {
      await removeFavoritePlan(token, id);
    } catch (err) {
      setFavorites(previousFavorites);
      setError(
        err instanceof Error ? err.message : "No se pudo quitar el favorito",
      );
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-primary/10 bg-white p-6">
        <div className="flex items-center gap-3 text-slate-500">
          <Icon name="progress_activity" className="animate-spin" />
          <span className="text-sm font-medium">Cargando favoritos...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Favoritos</h2>
          <p className="text-sm text-slate-500">
            Planes guardados para comparar y reservar despues.
          </p>
        </div>
        <Link
          href="/planes"
          className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90 sm:self-auto"
        >
          <Icon name="explore" className="text-base" />
          Explorar planes
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name="favorite" fill className="text-3xl" />
          </div>
          <h3 className="font-bold text-slate-900">Aun no tienes favoritos</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Guarda los planes que te interesen desde el catalogo y apareceran aqui.
          </p>
          <Link
            href="/planes"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-primary px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            Ver planes disponibles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {favorites.map((plan) => (
            <TourCard
              key={plan.id}
              plan={{ ...plan, isFavorite: true }}
              onToggleFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProfileFavorites;
