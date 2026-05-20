import { ProfileSchema } from "@/schemas/profile";
import { PaquetesApiSchema } from "@/schemas/paqueteApi";
import { type ProfileData } from "@/types/profile";
import { type PlanCatalogItem } from "@/types/planCatalog";
import { buildApiUrl, parseApiError } from "@/lib/api";
import { mapPaquetesToCatalog } from "@/services/planCatalog";
import { extractPlanSlug } from "@/utils/planId";

export const getProfile = async (token: string): Promise<ProfileData> => {
  const response = await fetch(buildApiUrl("/usuarios/me/perfil"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo cargar el perfil");
  }

  const data = await response.json();
  return ProfileSchema.parse(data);
};

export const updateProfile = async (
  token: string,
  profileData: { name: string; location: string; bio: string }
): Promise<void> => {
  const response = await fetch(buildApiUrl("/usuarios/me"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Error al actualizar el perfil");
  }
};

export const changePassword = async (
  token: string,
  passwordData: { current_password: string; new_password: string },
): Promise<void> => {
  const response = await fetch(buildApiUrl("/usuarios/me/password"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo cambiar la contrasena");
  }
};

export const getFavoritePlans = async (token: string): Promise<PlanCatalogItem[]> => {
  const response = await fetch(buildApiUrl("/usuarios/me/favoritos"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudieron cargar los favoritos");
  }

  const data = await response.json();
  const paquetes = PaquetesApiSchema.parse(data);
  return mapPaquetesToCatalog(paquetes).map((plan) => ({
    ...plan,
    isFavorite: true,
  }));
};

export const addFavoritePlan = async (
  token: string,
  planId: string,
): Promise<void> => {
  const slug = encodeURIComponent(extractPlanSlug(planId));
  const response = await fetch(buildApiUrl(`/usuarios/me/favoritos/${slug}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo agregar el favorito");
  }
};

export const removeFavoritePlan = async (
  token: string,
  planId: string,
): Promise<void> => {
  const slug = encodeURIComponent(extractPlanSlug(planId));
  const response = await fetch(buildApiUrl(`/usuarios/me/favoritos/${slug}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo quitar el favorito");
  }
};
