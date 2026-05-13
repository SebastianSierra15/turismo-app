import { ProfileSchema } from "@/schemas/profile";
import { type ProfileData } from "@/types/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const getProfile = async (token: string): Promise<ProfileData> => {
  const response = await fetch(`${API_URL}/usuarios/me/perfil`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let detail = "No se pudo cargar el perfil";
    try {
      const errorBody = await response.json();
      detail = errorBody?.detail ?? detail;
    } catch {
      // noop
    }
    const error = new Error(detail);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const data = await response.json();
  return ProfileSchema.parse(data);
};

export const updateProfile = async (
  token: string,
  profileData: { name: string; location: string; avatar: string; bio: string }
): Promise<ProfileData> => {
  const response = await fetch(`${API_URL}/usuarios/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el perfil");
  }

  const data = await response.json();
  return ProfileSchema.parse(data);
};
